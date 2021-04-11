export const Colors = {
    DARK_GREY: '#212123',
    LIGHT_GREY: '#dcdcdc',
    EBONY: '#2f3334',
    STEEL_GREY: '#434748',
    MONTANA: '#373c3d',
    BLUE_PRIMARY: '#1671d3',
    BOKARA_GREY: '#2d2723',
    ACADIA: '#342e2a',
}

export const Theme = {
    BG: null,
    BG_SECONDARY: null,
    FG: null,
}
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    Object.assign(Theme, {
        BG: Colors.BOKARA_GREY,
        BG_SECONDARY: Colors.ACADIA,
        FG: Colors.EBONY,
    })
}
