'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

export interface CalEmbedProps {
    namespace?: string;
    calLink?: string;
    theme?: 'light' | 'dark' | 'auto';
    brandColor?: string;
    hideEventTypeDetails?: boolean;
    layout?: 'month_view' | 'week_view' | 'column_view';
    style?: React.CSSProperties;
    className?: string;
}

export default function CalEmbed({
    namespace = 'meet',
    calLink = 'mergex/meet',
    theme = 'light',
    brandColor = '#000000',
    hideEventTypeDetails = false,
    layout = 'month_view',
    style = { width: '100%', height: '100%', overflow: 'scroll', minHeight: '650px' },
    className = '',
}: CalEmbedProps) {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ namespace });
            cal('ui', {
                theme,
                cssVarsPerTheme: {
                    light: { 'cal-brand': brandColor },
                    dark: { 'cal-brand': '#ffffff' },
                },
                hideEventTypeDetails,
                layout,
            });
        })();
    }, [namespace, theme, brandColor, hideEventTypeDetails, layout]);

    return (
        <Cal
            namespace={namespace}
            calLink={calLink}
            style={style}
            className={className}
            config={{
                layout,
                useSlotsViewOnSmallScreen: 'true',
                theme,
            }}
        />
    );
}
