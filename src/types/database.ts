export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            events: {
                Row: {
                    id: number
                    owned_by: string
                    created_by: string
                    source: string
                    external_id: string | null
                    title: string
                    starts_at: string
                    ends_at: string
                    color: string
                    is_pending: boolean | null
                    last_sync: string | null
                    sync_status: string | null
                    ms_etag: string | null
                    approval_status: string | null
                    created_at: string
                    updated_at: string
                    deleted_at: string | null
                }
                Insert: {
                    id?: never
                    owned_by: string
                    created_by: string
                    source: string
                    external_id?: string | null
                    title: string
                    starts_at: string
                    ends_at: string
                    color: string
                    is_pending?: boolean | null
                    last_sync?: string | null
                    sync_status?: string | null
                    ms_etag?: string | null
                    approval_status?: string | null
                    created_at: string
                    updated_at: string
                    deleted_at?: string | null
                }
            }
        }
    }
}