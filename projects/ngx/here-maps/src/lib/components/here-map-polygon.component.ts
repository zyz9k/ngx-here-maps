import { Component, Input, OnInit, OnDestroy, SimpleChanges, OnChanges } from "@angular/core";

import { HereMapsService} from "../here-maps.service";

@Component({
    selector: 'here-map-polygon',
    template: '<ng-content></ng-content>'
})
export class HereMapPolygonComponent implements OnInit, OnChanges, OnDestroy {

	@Input() polygon: GeoJSON.Polygon;
	@Input() style: any; /*H.map.SpatialStyle*/

	private mapPolygon: H.map.Polygon;

    constructor(private apiWrapper: HereMapsService) {

    }
	
	ngOnInit() {
		if (this.polygon)
			this.initPolygon(this.polygon);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['polygon'] && !changes['polygon'].isFirstChange()) {
			this.removePolygon();
			this.initPolygon(changes['polygon'].currentValue);
		}
		if (changes['style'] && !changes['style'].isFirstChange()) {
			this.updateStyles(changes['style'].currentValue);
		}
	}

	ngOnDestroy() {
		this.removePolygon();
	}

	private initPolygon(polygon: GeoJSON.Polygon) {
		let strip = new H.geo.Strip();
		polygon.coordinates[0].forEach(v => {
			strip.pushLatLngAlt(v[1], v[0], 0);
		});

		let mapPolygon = new H.map.Polygon(strip, this.style ? {
			style: this.style
		} : null);

		this.apiWrapper.addObject(mapPolygon);
		this.mapPolygon = mapPolygon;
	}

	private updateStyles(styles: any) {
		if (this.mapPolygon)
			this.mapPolygon.setStyle(styles);
	}

	private removePolygon() {
		if (this.mapPolygon)
			this.apiWrapper.removeObject(this.mapPolygon);
	}
}