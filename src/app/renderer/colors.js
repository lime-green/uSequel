export const Colors = {
    DARK_GREY: '#212123',
    LIGHT_GREY: '#dcdcdc',
    EBONY: '#2f3334',
    STEEL_GREY: '#434748',
    MONTANA: '#373c3d',
    BLUE_PRIMARY: '#1671d3',
    BOKARA_GREY: '#2d2723',
    ACADIA: '#342e2a',
    JAGUAR: '#2c292b',
}

export const Theme = {
    ACCENT: null,
    BG: null,
    BG_SECONDARY: null,
    BG_SIDEBAR: null,
    FG: null,
}
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    Object.assign(Theme, {
        ACCENT: Colors.STEEL_GREY,
        BG: Colors.BOKARA_GREY,
        BG_SECONDARY: Colors.ACADIA,
        BG_SIDEBAR: Colors.JAGUAR,
        FG: Colors.EBONY,
    })
}
