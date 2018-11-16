import { Component, Input, OnInit, EventEmitter, Output, OnDestroy } from "@angular/core";

import { HereMapsService} from "../here-maps.service";

@Component({
	selector: 'here-map-marker',
	template: ''
})
export class HereMapMarkerComponent implements OnInit, OnDestroy {

	@Input() position: H.geo.IPoint;
	@Input() min: number;
	@Input() max: number;
	@Input() visibility: boolean;
	@Input() zIndex: number;
	@Input() provider: any; // H.map.provider.Provider
	@Input() icon: any; // H.map.DomIcon
	@Input() data: any;

	@Output()
	private markerClick: EventEmitter<H.map.DomMarker> = new EventEmitter();
	@Output()
	private markerOver: EventEmitter<H.map.DomMarker> = new EventEmitter();
	@Output()
	private markerOut: EventEmitter<H.map.DomMarker> = new EventEmitter();

	private nativeMarker: H.map.DomMarker;

	constructor(private apiWrapper: HereMapsService) {

	}

	ngOnInit() {
		this.nativeMarker = new H.map.DomMarker(this.position, this.buildOptions());
		this.apiWrapper.addObject(this.nativeMarker);
		this.handleMarkerEvents();
	}

	ngOnDestroy() {
		this.nativeMarker.dispose();
	}

	private handleMarkerEvents() {
		this.nativeMarker.addEventListener('pointerenter', () => this.markerOver.emit(this.nativeMarker));
		this.nativeMarker.addEventListener('pointerleave', () => this.markerOut.emit(this.nativeMarker));
		this.nativeMarker.addEventListener('pointerup', (e: H.util.Event) => {
			this.markerClick.emit(this.nativeMarker);
			e.stopPropagation();
		});
	}

	private buildOptions(): H.map.Marker.Options {
		let options: H.map.Marker.Options = {
			data: this.data,
			icon: this.icon,
			max: this.max,
			min: this.min,
			provider: this.provider,
			visibility: this.visibility,
			zIndex: this.zIndex
		};

		let keys = Object.keys(options);
		for (let key of keys) {
			if (!options[key])
				delete options[key];
		}

		return options;
	}
}