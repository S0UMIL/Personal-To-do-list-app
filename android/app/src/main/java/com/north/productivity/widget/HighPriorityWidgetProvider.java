package com.north.productivity.widget;

public class HighPriorityWidgetProvider extends NorthWidgetProvider {
    @Override protected String getWidgetType() { return "high_priority"; }
    @Override protected String getRoute() { return "/"; }
}
