package com.north.productivity.widget;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

public final class NorthWidgetUpdateHelper {
    private NorthWidgetUpdateHelper() {}

    private static final Class<?>[] PROVIDERS = new Class<?>[] {
        TodayWidgetProvider.class,
        StreakWidgetProvider.class,
        AlertsWidgetProvider.class,
        NextFocusWidgetProvider.class,
        DayWidgetProvider.class,
        LibraryWidgetProvider.class,
        AreasTodayWidgetProvider.class,
        DailyQuoteWidgetProvider.class,
        RemainingWidgetProvider.class,
        ProgressWidgetProvider.class,
        HighPriorityWidgetProvider.class,
        GoogleTasksWidgetProvider.class,
        DoneWidgetProvider.class,
    };

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        for (Class<?> provider : PROVIDERS) {
            ComponentName component = new ComponentName(context, provider);
            int[] ids = manager.getAppWidgetIds(component);
            if (ids.length == 0) {
                continue;
            }
            Intent intent = new Intent(context, provider);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            context.sendBroadcast(intent);
        }
    }
}
