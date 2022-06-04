export type Banner = {
    text: string,
    color: string,
    icon: string,
}

let banners: Banner[] = [];

export function getBanners() : Banner[] {
    return banners;
}

export function setBanners(_banners: Banner[]) : void {
    banners = _banners;
}

export function removeBanner(index: number) {
    banners.splice(index, 1);
}

export default {
    error(text: string) {
        banners.push({
            text,
            color: 'red',
            icon: 'ban',
        });
    },
    warning(text: string) {
        banners.push({
            text,
            color: 'gold',
            icon: 'triangle-exclamation',
        });
    },
    info(text: string) {
        banners.push({
            text,
            color: 'blue',
            icon: 'info',
        });
    },
    success(text: string) {
        banners.push({
            text,
            color: 'green',
            icon: 'check',
        });
    }
};