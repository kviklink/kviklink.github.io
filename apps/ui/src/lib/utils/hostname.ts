export function hostnameFromUrl(url: string): string {
    return (new URL(url)).hostname
}