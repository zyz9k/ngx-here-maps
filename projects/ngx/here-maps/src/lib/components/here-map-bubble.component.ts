import { Component, Input, ElementRef, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";

import { HereMapsService} from "../here-maps.service";

@Component({
	selector: 'here-map-bubble',
	template: '<ng-content></ng-content>'
})
export class HereMapBubbleComponent implements OnDestroy, OnChanges {

	@Input() position: H.geo.IPoint;

	private infoBubble: H.ui.InfoBubble;

	constructor(private elementRef: ElementRef,
		private apiWrapper: HereMapsService) {

	}

	ngOnChanges(changes: SimpleChanges) {
		this.initBubble(changes.position.currentValue);
	}

	ngOnDestroy() {
		this.apiWrapper.removeInfoBubble(this.infoBubble);
	}

	private initBubble(position: H.geo.Point) {
		if (this.infoBubble)
			this.apiWrapper.removeInfoBubble(this.infoBubble);

		let infoBubble = new H.ui.InfoBubble(position, {
			content: this.elementRef.nativeElement
		});

		this.apiWrapper.addInfoBubble(infoBubble);
		this.infoBubble = infoBubble;
	}
}