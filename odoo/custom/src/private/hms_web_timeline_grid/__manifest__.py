{
    "name": "HMS Web Timeline Grid",
    "author": "Mallorca Software Hotelero, S.L",
    "summary": "Timneline Frid View",
    "version": "17.0.1.0.0",
    "license": "AGPL-3",
    "maintainer": ["aromera"],
    "website": "https://astrohms.com",
    "category": "web",
    "depends": [
        "web",
    ],
    "data": [
        "security/ir.model.access.csv",
        "views/timeline_grid_views.xml",
        "views/menu.xml",
    ],
    "installable": True,
    "assets": {
        "web.assets_backend": [
            "hms_web_timeline_grid/static/src/views/**/*",
        ]
    },
}
