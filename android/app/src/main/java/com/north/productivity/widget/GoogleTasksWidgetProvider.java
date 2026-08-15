package com.north.productivity.widget;

public class GoogleTasksWidgetProvider extends NorthWidgetProvider {
    @Override protected String getWidgetType() { return "google_tasks"; }
    @Override protected String getRoute() { return "/profile"; }
}
