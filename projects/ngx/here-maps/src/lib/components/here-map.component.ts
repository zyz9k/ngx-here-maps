
import {interval as observableInterval,  Subscription } from 'rxjs';
import { filter, first, merge } from 'rxjs/operators';
import { Component, AfterViewInit, ElementRef, Input, Output, EventEmitter, OnDestroy, SimpleChanges, ViewChild, HostBinding } from "@angular/core";
import { MapViewType } from '../interfaces/map-view-type';

import { HereMapsService } from "../here-maps.service";

@Component({
	selector: 'here-map',
	templateUrl: './here-map.component.html',
	styleUrls: ['./here-map.component.scss'],
	providers: [HereMapsService]
})
export class HereMapComponent implements AfterViewInit, OnDestroy {

	@Input() center: H.geo.IPoint;
	@Input() zoom: number;
	@Input() bounds: any; // H.geo.Rect
	@Input() layers: Array<H.map.layer.Layer>;
	@Input() engineType: H.Map.EngineType;
	@Input() pixelRatio: number;
	@Input() imprint: H.map.Imprint.Options;
	@Input() renderBaseBackground: H.Map.BackgroundRange;
	@Input() autoColor: boolean;
	@Input() margin: number;
	@Input() padding: H.map.ViewPort.Padding;
	@Input() fixedCenter: boolean;
	@Input() noWrap: boolean;
	@Input() zoomCtrl: boolean;
	@Input() changeViewCtrl: boolean;
	@Input() scrollWheel: boolean;
	@Input() rocketCtrl: boolean;
	@Input() routesCtrl: boolean;
	@Input() animateZoomChange: boolean;
	@Input() animateCenterChange: boolean;
	@Input() animateBoundsChange: boolean;
    @Input() freeze: boolean;
	@Input() applyView : MapViewType;
	@HostBinding('class')
	@Input() theme: string;

	@Output()
	private mapReady: EventEmitter<void> = new EventEmitter();
	@Output()
	private zoomChange: EventEmitter<number> = new EventEmitter();
	@Output()
	private boundsChange: EventEmitter<H.geo.Rect> = new EventEmitter();
	@Output()
	private mapClick: EventEmitter<void> = new EventEmitter();
	@Output()
	private schemeChange: EventEmitter<string> = new EventEmitter();
	@Output()
	private rocketClick: EventEmitter<void> = new EventEmitter();
	@Output()
	private routesClick: EventEmitter<void> = new EventEmitter();
	@Output()
	private mapResize: EventEmitter<number[]> = new EventEmitter();

	@ViewChild('streetView')
	private streetViewContainer: ElementRef;

	public zoomInClicked: boolean;
	public zoomOutClicked: boolean;
	public changeViewShown: boolean;
	public viewScheme: string = 'normal.day';
	public streetViewShown: boolean;
	private streetViewCreated: boolean;

	private subscriptions: Array<Subscription> = [];

	constructor(private elementRef: ElementRef,
		private apiWrapper: HereMapsService) {

	}

	ngAfterViewInit() {
		let promises: Array<Promise<any>> = [this.apiWrapper.createMap(this.elementRef.nativeElement, this.buildOptions(), this.scrollWheel)];
		Promise.all(promises)
			.then(([v]) => {
				// hide "Street View" button if there is no street view avaliable
				this.handleZoomBoundsChange();
				this.handleResize();
				this.handleClick();
				this.mapReady.emit();
			});
	}

	ngOnChanges(changes: SimpleChanges) {

		if (changes['zoom'] && changes['zoom'].currentValue) {
			this.apiWrapper.setMapZoom(changes['zoom'].currentValue, this.animateZoomChange);
			this.emitBoundsChangeWhenStable();
		}

		if (changes['center'] && changes['center'].currentValue) {
			this.apiWrapper.setMapCenter(changes['center'].currentValue, this.animateCenterChange);
			this.emitBoundsChangeWhenStable();
		}

		if (changes['bounds'] && changes['bounds'].currentValue) {
			this.apiWrapper.setMapBounds(changes['bounds'].currentValue, this.animateBoundsChange);
			this.emitZoomChangeWhenStable();
		}

		

		if (changes['freeze'])
            this.handleFreeze(changes['freeze'].currentValue);

        if (changes['applyView']) {
            switch (changes['applyView'].currentValue){
                case MapViewType.Normal: this.changeView('base', 'normal.day'); break;
                case MapViewType.Satellite: this.changeView('aerial', 'hybrid.day'); break;
                case MapViewType.Terrain: this.changeView('aerial', 'terrain.day'); break;
            }
        }
	}

	ngOnDestroy() {
		this.apiWrapper.disposeMap();
		for (let subscription of this.subscriptions) {
			subscription.unsubscribe();
		}
	}

	public handleZoomCtrlClick(zoomIn: boolean) {
		if (this.freeze)
			return;

		Promise.resolve(this.apiWrapper.getMapZoom())
			.then(zoom => {
				let newZoom = zoomIn ? ++zoom : --zoom;
				this.apiWrapper.setMapZoom(newZoom, this.animateZoomChange);
				this.zoomChange.emit(newZoom);
				this.emitBoundsChangeWhenStable();
			});
	}

    public toggleChangeViewCtrl() {
        if (this.freeze)
            return;
		this.changeViewShown = !this.changeViewShown;
		if (this.changeViewShown) {
			this.subscriptions.push(
				this.mapClick.pipe(first())
					.subscribe(() => this.changeViewShown = false)
			);
		}
	}

    public changeView(type: string, scheme: string) {
		if (this.viewScheme == scheme)
			return;

		this.viewScheme = scheme;
		this.apiWrapper.changeMapView(type, scheme);
        this.schemeChange.emit(scheme);
        this.changeViewShown = false;
	}

	public onRocketClick() {
		this.rocketClick.emit();
	}

	public onRoutesClick() {
		this.routesClick.emit();
	}

	private handleFreeze(freezeMap: boolean) {
		//0 index - DBLTAPZOOM
		//1 index - DRAGGING
		//2 index - WHEELZOOM

		if (freezeMap)
			this.apiWrapper.changeBehavior([false, false, false]);
		else
			this.apiWrapper.changeBehavior([true, true, this.scrollWheel]);
	}

	private handleZoomBoundsChange() {
		let previousZoom = 0;

		this.subscriptions.push(
			this.apiWrapper.subscribeToMapEvent('dbltap').pipe(
				merge(this.apiWrapper.subscribeToMapEvent('wheel')),
				merge(this.apiWrapper.subscribeToMapEvent('dragend')))
				.subscribe((e: H.util.Event) => {
					this.emitZoomChangeWhenStable();
					this.emitBoundsChangeWhenStable();
				})
		);
	}

	private handleClick() {
		this.subscriptions.push(
			this.apiWrapper.subscribeToMapEvent('pointerup').subscribe((e: H.util.Event) => {
				this.mapClick.emit();
			})
		);
	}

	private handleResize() {
		let previousElementWidth = this.elementRef.nativeElement.clientWidth;
		let previousElementHeight = this.elementRef.nativeElement.clientHeight;

		this.subscriptions.push(
			observableInterval(500).pipe(
				filter(() => {
					return this.elementRef.nativeElement.clientWidth != previousElementWidth
						|| this.elementRef.nativeElement.clientHeight != previousElementHeight;
				}))
				.subscribe(() => {
					previousElementWidth = this.elementRef.nativeElement.clientWidth;
					previousElementHeight = this.elementRef.nativeElement.clientHeight;
					this.apiWrapper.resizeMap();
					this.mapResize.emit([previousElementWidth, previousElementHeight]);
				})
		);
	}

	private buildOptions(): H.Map.Options {
		let options: H.Map.Options =  {
			autoColor: this.autoColor,
			bounds: this.bounds,
			center: this.center,
			engineType: this.engineType,
			fixedCenter: this.fixedCenter,
			imprint: this.imprint,
			layers: this.layers,
			margin: this.margin,
			padding: this.padding,
			pixelRatio: this.pixelRatio,
			renderBaseBackground: this.renderBaseBackground,
			zoom: this.zoom
		}

		let keys = Object.keys(options);
		for (let key of keys) {
			if (!options[key])
				delete options[key];
		}

		return options;
	}

	private emitBoundsChangeWhenStable() {
		let prevBounds: H.geo.Rect = new H.geo.Rect(0, 0, 0, 0);

		let interval = setInterval(() => {
			this.apiWrapper.getMapBounds()
				.then(bounds => {
					if (prevBounds.equals(bounds)) {
						this.boundsChange.emit(bounds);
						clearInterval(interval);
					} else {
						prevBounds = bounds;
					}
				});
		}, 250);
	}

	private emitZoomChangeWhenStable() {
		let prevZoom: number = 0;

		let interval = setInterval(() => {
			this.apiWrapper.getMapZoom()
				.then(zoom => {
					if (prevZoom == zoom) {
						this.zoomChange.emit(zoom);
						clearInterval(interval);
					} else {
						prevZoom = zoom;
					}
				});
		}, 250);
	}

}
