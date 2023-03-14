declare module '@sparkit-gmbh/express-health-check' {
    export type MiddlewareWrapperConfig = {
        path?: string;
        db?: boolean;
        api?: boolean;
        system?: boolean;
        path?: string;
    };


    export type MiddlewareWrapperReturn = (req: Express.Request, res: Express.Response, next: NextFunction) => void;
    
    export function MiddlewareWrapper(config: MiddlewareWrapperConfig): MiddlewareWrapperReturn;
}