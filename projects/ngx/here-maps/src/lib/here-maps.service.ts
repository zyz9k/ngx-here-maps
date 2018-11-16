import { Injectable, NgZone, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { HereMapConfig, HERE_MAP_CONFIG } from './interfaces/here-map-config';

import 'heremaps';
@Injectable()
export class HereMapsService {
	private map: Promise<H.Map>;

	private mapUI: H.ui.UI;
	private platform: H.service.Platform;
	private mapResolver: (value: H.Map) => void;
	
	private mapBehavior: H.mapevents.Behavior;

	constructor(private _zone: NgZone, @Inject(HERE_MAP_CONFIG) private config: HereMapConfig) {
        this.map = new Promise<H.Map>((resolve: () => void) => {
            this.mapResolver = resolve;
		});
		
    }

	createMap(el: HTMLElement, options: H.Map.Options, scrollWheel: boolean): Promise<void> {
		return new Promise(resolve => {
				// setTimeout fix incorrect canvas height, which calculated inside core library
				setTimeout(() => {
					this.platform = new H.service.Platform({
						'app_id': this.config.AppId,
						'app_code': this.config.AppKey,
						useHTTPS: true

					});

					let baseLayer = this.createTileLayer('base', 'normal.day');
					const map = new H.Map(el, baseLayer, options);
					this.mapUI = new H.ui.UI(map);

					// Add map events functionality to the map
					var mapEvents = new H.mapevents.MapEvents(map);

					// Add behavior to the map: panning, zooming, dragging.
					this.mapBehavior = new H.mapevents.Behavior(mapEvents);
					if (!scrollWheel)
						this.mapBehavior.disable(H.mapevents.Behavior.WHEELZOOM);

					this.mapResolver(<H.Map>map);
					resolve();
				}, 10);
			});
	}

	/**
	 *
	 * @param type E.g. aerial.
	 * @param scheme E. g. hybrid, terrain, etc.
	 */
	changeMapView(type: string, scheme: string) {
		this.map.then(map => {
			let baseLayer = this.createTileLayer(type, scheme);
			map.setBaseLayer(baseLayer);
		});
	}

	disposeMap() {
		this.map.then((map: H.Map) => map.dispose());
	}

    subscribeToMapEvent(eventName: string): Observable<H.util.Event> {
        return Observable.create((observer: Observer<H.util.Event>) => {
			this.map.then((m: H.Map) => {
                m.addEventListener(eventName, (e: H.util.Event) => {
                    observer.next(e);
                });
            })
        })
    }

	getMapZoom(): Promise<number> {
		return this.map.then((map: H.Map) => map.getZoom());
	}

	getMapBounds(): Promise<H.geo.Rect> {
		return this.map.then((map: H.Map) => map.getViewBounds());
	}

	getRoutingService(): Promise<H.service.RoutingService> {
		return this.map.then(() => {
			return this.platform.getRoutingService();
		});
	}

	setMapZoom(zoom: number, animate: boolean): void {
		this.map.then((map: H.Map) => map.setZoom(zoom, animate));
	}

	setMapBounds(bounds: H.geo.Rect, animate: boolean): void {
		this.map.then((map: H.Map) => map.setViewBounds(bounds, animate));
	}

	setMapCenter(center: H.geo.IPoint, animate: boolean): void {
		this.map.then((map: H.Map) => map.setCenter(center, animate));
	}

	addLayer(layer: H.map.layer.ObjectLayer, index: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.map.then((map: H.Map) => {
				map.addLayer(layer, index);
				resolve();
			});
		});
	}

	removeLayer(layer: H.map.layer.ObjectLayer): Promise<void> {
		return new Promise((resolve, reject) => {
			this.map.then((map: H.Map) => {
				map.removeLayer(layer);
				resolve();
			});
		});
	}

	addInfoBubble(bubble: H.ui.InfoBubble): void {
		this.mapUI.addBubble(bubble);
	}

	removeInfoBubble(bubble: H.ui.InfoBubble): void {
		this.mapUI.removeBubble(bubble);
	}

	addObject(object: H.map.Object) {
		this.map.then(map => map.addObject(object));
	}

	removeObject(object: H.map.Object) {
		this.map.then(map => map.removeObject(object));
	}

	resizeMap() {
		this.map.then(map => map.getViewPort().resize());
	}

	changeBehavior(behaviorOptions: Array<boolean>) {
		this.map.then(map => {
			for (let eventNum = 0; eventNum < behaviorOptions.length; eventNum++) {
				if (behaviorOptions[eventNum])
					this.mapBehavior.enable(eventNum);
				else
					this.mapBehavior.disable(eventNum);
			}
		});
	}

	/**
	 *
	 * @param type E.g. aerial.
	 * @param scheme E. g. hybrid, terrain, etc.
	 */
	private createTileLayer(type: string, scheme: string): H.map.layer.Layer {
		let mapTileService = this.platform.getMapTileService({
			type: type,

		});
		let highRes = (window.devicePixelRatio || 1) >= 1.5;
		let layer = mapTileService.createTileLayer(
            'maptile',
            scheme,
            highRes ? 512 : 256,
            'png8',
            {
                ppi: '250',
                tileSize: highRes ? '512' : '256',
                lg: 'dan'
            }
        );
		return layer;
	}
}
