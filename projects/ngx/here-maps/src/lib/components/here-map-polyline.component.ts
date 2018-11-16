import { Component, Input, SimpleChanges, OnInit, OnChanges, OnDestroy } from "@angular/core";

import { HereMapsService} from "../here-maps.service";

@Component({
	selector: 'here-map-polyline',
	template: ''
})
export class HereMapPolylineComponent implements OnInit, OnChanges, OnDestroy {

	@Input() polyline: GeoJSON.LineString;
	@Input() style: { [key: string]: string };

	private mapPolyline: H.map.Polyline;

	constructor(private apiWrapper: HereMapsService) {
	}

	ngOnInit() {
		if (this.polyline)
			this.initPolyline(this.polyline);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['polyline'] && !changes['polyline'].isFirstChange()) {
			this.removePolyline();
			this.initPolyline(changes['polyline'].currentValue);
		}
		if (changes['style'] && !changes['style'].isFirstChange()) {
			this.updateStyles(changes['style'].currentValue);
		}
	}

	ngOnDestroy() {
		this.removePolyline();
	}

	private initPolyline(polyline: GeoJSON.LineString) {
		let lineString = new (<any>H.geo).LineString();

		polyline.coordinates.forEach(function (points) {
			lineString.pushLatLngAlt(points[0], points[1]);
		});

		let mapPolyline = new H.map.Polyline(lineString, this.style ? {
			style: this.style
		} : null);

		this.apiWrapper.addObject(mapPolyline);
		this.mapPolyline = mapPolyline;
	}

	private updateStyles(styles: any) {
		if (this.mapPolyline)
			this.mapPolyline.setStyle(styles);
	}

	private removePolyline() {
		if (this.mapPolyline)
			this.apiWrapper.removeObject(this.mapPolyline);
	}
}