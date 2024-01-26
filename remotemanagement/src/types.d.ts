declare global {
    namespace Application {
        interface RealtimeData {
            temperature: number,
            humidity: number,
            rain: boolean,
            roof: boolean,
            time: string,
        }
    }
}

export {};