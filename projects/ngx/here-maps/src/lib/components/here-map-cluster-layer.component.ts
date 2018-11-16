import { Component, Input, OnChanges, Output, EventEmitter, OnDestroy, SimpleChanges } from "@angular/core";

import { HereMapsService} from "../here-maps.service";

@Component({
	selector: 'here-map-clustering-layer',
	template: ''
})
export class HereMapClusteringLayerComponent implements OnChanges, OnDestroy {

	@Input() theme: H.clustering.ITheme;
	@Input() markers: Array<H.geo.IPoint>;

	@Output()
	private markerClick: EventEmitter<H.map.Marker> = new EventEmitter();

	private layer: H.map.layer.ObjectLayer;

	constructor(private apiWrapper: HereMapsService) {

	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['markers'])
			this.handleNewMarkers();
	}

	handleNewMarkers() {
		if (this.layer)
			this.apiWrapper.removeLayer(this.layer);

		let markers = this.markers || [];
		let dataPoints = markers.map(function (item) {
			return new H.clustering.DataPoint(item.lat, item.lng, null, item);
		});
		
		let clusteredDataProvider = new H.clustering.Provider(dataPoints, {
			theme: this.theme,
		});
		clusteredDataProvider.addEventListener('pointerup', (e: H.util.Event) => {
			let marker = new H.map.Marker(e.target.getPosition(), {
				data: e.target.getData()
			});
			this.markerClick.emit(marker);
			e.stopPropagation();
		});

		this.layer = new H.map.layer.ObjectLayer(clusteredDataProvider);

		this.apiWrapper.addLayer(this.layer, 2);
	}

	ngOnDestroy() {
		this.layer.dispose();
	}
}