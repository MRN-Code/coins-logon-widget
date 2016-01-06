'use strict';

var VNode = require('virtual-dom').VNode;
var VText = require('virtual-dom').VText;

/**
 * Indicator.
 *
 * @returns {VNode}
 */
function indicator() {
    var svgNamespace = 'http://www.w3.org/2000/svg';

    return new VNode(
        'div',
        {
            className: 'coins-logon-widget-indicator',
        },
        [
            new VNode(
                'svg',
                undefined,
                [
                    new VNode(
                        'title',
                        undefined,
                        [new VText('Loading…')],
                        undefined,
                        svgNamespace
                    ),
                    new VNode(
                        'circle',
                        {
                            attributes: {
                                cx: '20',
                                cy: '20',
                                fill: 'none',
                                r: '8',
                                'stroke-width': '2',
                                'stroke-miterlimit': '4',
                            },
                        },
                        undefined,
                        undefined,
                        svgNamespace
                    ),
                ],
                undefined,
                svgNamespace
            )
        ]
    );
}

module.exports = indicator;
