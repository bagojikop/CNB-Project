export interface RdlcViewerParam {
    key: string;
    value: unknown;
}

export type RdlcViewerProps = {
    url: string;
    params: RdlcViewerParam[] | Record<string, unknown>;
};

/** @deprecated Use RdlcViewerProps. */
export type rdlcViewerProps = RdlcViewerProps;
