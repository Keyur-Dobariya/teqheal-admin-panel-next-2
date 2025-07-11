'use client';

import {capitalizeLastPathSegment} from "../../../utils/utils";
import pageRoutes from "../../../utils/pageRoutes";

export default function Page() {
    return (
        <div>{capitalizeLastPathSegment(pageRoutes.dashboard)}</div>
    );
}