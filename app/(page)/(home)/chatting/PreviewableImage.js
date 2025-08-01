'use client';

import { Image, Skeleton } from 'antd';
import { useState } from 'react';

export const PreviewableImage = ({ src }) => {
    const [loading, setLoading] = useState(true);

    return (
        <div style={{ width: 230, maxHeight: 230, position: 'relative' }}>
            {loading && <Skeleton.Image style={{ width: 230, height: 230 }} active />}
            <Image
                src={src}
                width={230}
                style={{
                    maxHeight: 230,
                    display: loading ? 'none' : 'block',
                }}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
            />
        </div>
    );
};
