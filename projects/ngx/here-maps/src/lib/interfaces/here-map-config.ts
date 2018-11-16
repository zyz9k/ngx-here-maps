import { InjectionToken } from "@angular/core";

export interface HereMapConfig {
	readonly AppId: string;
	readonly AppKey: string;
	readonly StreetViewKey: string;
}

export let HERE_MAP_CONFIG = new InjectionToken('HERE_MAP_CONFIG');