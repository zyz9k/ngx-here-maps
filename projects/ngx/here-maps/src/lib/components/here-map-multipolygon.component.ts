import { Component, Input, OnDestroy, SimpleChanges, OnChanges } from "@angular/core";

import { HereMapsService} from "../here-maps.service";
@Component({
    selector: 'here-map-multi-polygon',
    template: '<ng-content></ng-content>'
})
export class HereMapMultiPolygonComponent implements OnChanges, OnDestroy {

	@Input() multiPolygon: GeoJSON.MultiPolygon;
	@Input() style: any; /*H.map.SpatialStyle*/

	private mapPolygon: any; /*H.map.MultiPolygon*/

    constructor(private apiWrapper: HereMapsService) {

    }

	ngOnInit() {
		if (this.multiPolygon)
			this.initPolygon(this.multiPolygon);
	}
	
	ngOnChanges(changes: SimpleChanges) {
		if (changes['multiPolygon'] && !changes['multiPolygon'].isFirstChange()) {
			this.removePolygon();
			this.initPolygon(changes['multiPolygon'].currentValue);
		}
		if (changes['style'] && !changes['style'].isFirstChange()) {
			this.updateStyles(changes['style'].currentValue);
		}
	}

	ngOnDestroy() {
		this.removePolygon();
	}

	private initPolygon(multiPolygon: GeoJSON.MultiPolygon) {
		let polygonArr: Array<H.map.Polygon> = multiPolygon.coordinates.map((polygon, index) => {
			let strip = new H.geo.Strip();
			polygon[index].forEach(v => {
				strip.pushLatLngAlt(v[1], v[0], 0);
			});
			return new H.map.Polygon(strip, this.style ? {
				style: this.style
			} : null);
		});

		let mapPolygon = new (<any>H.geo).MultiPolygon(polygonArr);

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