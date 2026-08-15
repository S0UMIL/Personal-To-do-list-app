package com.north.productivity.widget;

import android.content.Intent;

/** Routes widget taps into MainActivity without using localhost URLs. */
public final class WidgetLaunchRouter {
    public static final String ACTION_WIDGET_OPEN = "com.north.productivity.action.WIDGET_OPEN";
    public static final String EXTRA_ROUTE = "north_widget_route";

    private static String pendingRoute;

    private WidgetLaunchRouter() {}

    public static void handle(Intent intent) {
        if (intent == null || !ACTION_WIDGET_OPEN.equals(intent.getAction())) {
            return;
        }
        String route = intent.getStringExtra(EXTRA_ROUTE);
        if (route != null && !route.isEmpty()) {
            pendingRoute = route;
        }
    }

    public static String consumeRoute() {
        String route = pendingRoute;
        pendingRoute = null;
        return route;
    }
}
