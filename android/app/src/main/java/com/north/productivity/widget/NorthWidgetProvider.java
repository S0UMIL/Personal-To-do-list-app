package com.north.productivity.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

public abstract class NorthWidgetProvider extends AppWidgetProvider {
    protected abstract String getWidgetType();

    protected abstract String getRoute();

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            NorthWidgetRenderer.update(context, manager, appWidgetId, getWidgetType(), getRoute());
        }
    }
}
