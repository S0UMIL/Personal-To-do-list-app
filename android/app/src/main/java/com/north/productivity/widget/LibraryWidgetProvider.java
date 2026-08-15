package com.north.productivity.widget;

public class LibraryWidgetProvider extends NorthWidgetProvider {
    @Override protected String getWidgetType() { return "library"; }
    @Override protected String getRoute() { return "/tasks"; }
}
