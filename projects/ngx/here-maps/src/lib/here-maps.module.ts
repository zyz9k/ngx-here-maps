import { NgModule, ModuleWithProviders, NgZone } from "@angular/core";
import { CommonModule } from "@angular/common";

// Declaratives
import {
	HereMapComponent,
	HereMapMarkerComponent,
	HereMapBubbleComponent,
	HereMapClusteringLayerComponent,
  HereMapPolylineComponent,
	HereMapPolygonComponent,
	HereMapMultiPolygonComponent
} from "./components";

// Providers
import {
	HereMapsService
} from "./here-maps.service";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
		HereMapComponent,
		HereMapMarkerComponent,
		HereMapBubbleComponent,
		HereMapClusteringLayerComponent,
    HereMapPolylineComponent,
		HereMapPolygonComponent,
		HereMapMultiPolygonComponent
	],
	exports: [
		HereMapComponent,
		HereMapMarkerComponent,
		HereMapBubbleComponent,
		HereMapClusteringLayerComponent,
        HereMapPolylineComponent,
		HereMapPolygonComponent,
		HereMapMultiPolygonComponent
	]
})
export class HereMapsModule {

	static forRoot(): ModuleWithProviders {
		return {
			ngModule: HereMapsModule
		}
	}
}