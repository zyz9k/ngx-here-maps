export interface HereMapMarker {
	nativeMarker: H.map.DomMarker;
	markerType: HereMapMarkerType;
}

export enum HereMapMarkerType {
	DepartureMarker,
	DestinationMarker,
	TimeMarker
}