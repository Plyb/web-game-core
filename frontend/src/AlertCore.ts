export type Banner = {
    text: string,
    color: string,
    icon: string,
    time?: number,
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

function beginTimer(time?: number) {
    if (time) {
        const banner = banners[banners.length - 1];
        setTimeout(() => {
            banners.splice(banners.indexOf(banner), 1);
        }, time);
    }
}

export default {
    error(text: string, time?: number) {
        banners.push({
            text,
            color: 'red',
            icon: 'ban',
        });
        beginTimer(time);
    },
    warning(text: string, time?: number) {
        banners.push({
            text,
            color: 'gold',
            icon: 'triangle-exclamation',
        });
        beginTimer(time);
    },
    info(text: string, time?: number) {
        banners.push({
            text,
            color: 'blue',
            icon: 'info',
        });
        beginTimer(time);
    },
    success(text: string, time?: number) {
        banners.push({
            text,
            color: 'green',
            icon: 'check',
        });
        beginTimer(time);
    }
};