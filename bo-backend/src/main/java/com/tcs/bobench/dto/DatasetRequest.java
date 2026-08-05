package com.tcs.bobench.dto;

public class DatasetRequest {
    private String name;
    private String path;
    private Integer rows;
    private Integer columns;
    private String target;

    public DatasetRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public Integer getRows() { return rows; }
    public void setRows(Integer rows) { this.rows = rows; }
    public Integer getColumns() { return columns; }
    public void setColumns(Integer columns) { this.columns = columns; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
}
