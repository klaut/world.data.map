(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  jQuery(function() {
    var Cities, CitiesView, City, WorldView, worldMap;
    City = (function(_super) {

      __extends(City, _super);

      function City() {
        City.__super__.constructor.apply(this, arguments);
      }

      return City;

    })(Backbone.Model);
    Cities = (function(_super) {

      __extends(Cities, _super);

      function Cities() {
        Cities.__super__.constructor.apply(this, arguments);
      }

      Cities.prototype.model = City;

      return Cities;

    })(Backbone.Collection);
    CitiesView = (function(_super) {

      __extends(CitiesView, _super);

      function CitiesView() {
        CitiesView.__super__.constructor.apply(this, arguments);
      }

      CitiesView.prototype.initialize = function() {
        _.bindAll(this);
        this.parentView = this.options.parentView;
        this.cities = this.parentView.map.append("svg:g").attr("id", "cities-" + this.className);
        this.collection = new Cities;
        this.collection.reset(this.options.collectionData);
        return this.render();
      };

      CitiesView.prototype.render = function() {
        var data, projection, r;
        data = this.collection.toJSON();
        r = d3.scale.linear().domain(this.getRange(data)).range([3, 30]);
        projection = this.parentView.projection;
        this.cities.selectAll("circle").data(data).enter().append("svg:circle").attr("class", this.className).attr("r", function(d) {
          return r(d.value);
        }).attr("cx", function(d) {
          return projection([d.longitude, d.latitude])[0];
        }).attr("cy", function(d) {
          return projection([d.longitude, d.latitude])[1];
        }).append("svg:title").text(function(d) {
          return d.city;
        });
        return this;
      };

      CitiesView.prototype.getRange = function(data) {
        var max, min, values;
        values = data.map(function(city) {
          return city.value;
        });
        min = values.reduce(function(a, b) {
          return Math.min(a, b);
        });
        max = values.reduce(function(a, b) {
          return Math.max(a, b);
        });
        return [min, max];
      };

      return CitiesView;

    })(Backbone.View);
    WorldView = (function(_super) {

      __extends(WorldView, _super);

      function WorldView() {
        WorldView.__super__.constructor.apply(this, arguments);
      }

      WorldView.prototype.el = $('#map');

      WorldView.prototype.geojson_paths = world_countries;

      WorldView.prototype.initialize = function() {
        _.bindAll(this);
        this.viewLayers = [];
        this.projection = d3.geo.mercator().scale(1).translate([0, 0]);
        this.path = d3.geo.path().projection(this.projection);
        this.map = d3.select("#" + $(this.el).attr('id')).append("svg:svg");
        this.world = this.map.append("svg:g").attr("id", "world");
        this.scaleWorldMap();
        return this.render();
      };

      WorldView.prototype.render = function() {
        var features;
        features = this.world.selectAll('path');
        features.data(this.geojson_paths.features).enter().append('svg:path').attr('id', function(d) {
          return d.id;
        }).attr('d', this.path).append('svg:title').text(function(d) {
          return d.properties.name;
        });
        return this;
      };

      WorldView.prototype.addViewLayer = function(data, viewClass, cssClass) {
        var view;
        view = new viewClass({
          collectionData: data,
          parentView: this,
          className: cssClass
        });
        return this.viewLayers.push(view);
      };

      WorldView.prototype.scaleWorldMap = function() {
        var bounds, bounds0, height, scale, width, xscale, yscale;
        width = $(this.el).width();
        height = $(this.el).height();
        bounds0 = d3.geo.bounds(this.geojson_paths);
        bounds = bounds0.map(this.projection);
        xscale = width / Math.abs(bounds[1][0] - bounds[0][0]);
        yscale = height / Math.abs(bounds[1][1] - bounds[0][1]);
        scale = Math.min(xscale, yscale);
        this.projection.scale(scale);
        return this.projection.translate(this.projection([-bounds0[0][0], -bounds0[1][1]]));
      };

      return WorldView;

    })(Backbone.View);
    Backbone.sync = function(method, model, success, error) {
      return success();
    };
    worldMap = new WorldView;
    worldMap.addViewLayer(cities1, CitiesView, "firstLayer");
    return worldMap.addViewLayer(cities2, CitiesView, "secondLayer");
  });

}).call(this);
