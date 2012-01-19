(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  jQuery(function() {
    var Cities, CitiesView, City, CityDetail, WorldView, worldMap;
    City = (function(_super) {

      __extends(City, _super);

      function City() {
        City.__super__.constructor.apply(this, arguments);
      }

      return City;

    })(Backbone.Model);
    CityDetail = (function(_super) {

      __extends(CityDetail, _super);

      function CityDetail() {
        CityDetail.__super__.constructor.apply(this, arguments);
      }

      CityDetail.prototype.tagName = 'div';

      CityDetail.prototype.className = 'city-detail';

      CityDetail.prototype.template = _.template($('#city-detail-tmp').html());

      CityDetail.prototype.initialize = function() {
        return _.bindAll(this);
      };

      CityDetail.prototype.render = function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      };

      return CityDetail;

    })(Backbone.View);
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

      CitiesView.prototype.tagName = 'g';

      CitiesView.prototype.initialize = function() {
        _.bindAll(this);
        this.parentView = this.options.parentView;
        this.el = this.parentView.map.append("svg:g").attr("id", "cities-" + this.className);
        this.collection = new Cities;
        this.collection.reset(this.options.collectionData);
        return this.render();
      };

      CitiesView.prototype.render = function() {
        var projection, r, self;
        r = d3.scale.linear().domain(this.getDataMinMax()).range([3, 20]);
        projection = this.parentView.projection;
        self = this;
        this.el.selectAll("circle").data(this.collection.models).enter().append("svg:circle").attr("class", this.className).attr("id", function(d) {
          return d.cid;
        }).attr("r", function(d) {
          return r(d.get('value'));
        }).attr("cx", function(d) {
          return projection([d.get('longitude'), d.get('latitude')])[0];
        }).attr("cy", function(d) {
          return projection([d.get('longitude'), d.get('latitude')])[1];
        }).on("mouseover", function(d) {
          return self.showDetail(d, this);
        }).on("mouseout", function(d) {
          return self.hideDetail(d, this);
        });
        return this;
      };

      CitiesView.prototype.getDataMinMax = function() {
        var max, min, values;
        values = this.collection.pluck('value');
        min = values.reduce(function(a, b) {
          return Math.min(a, b);
        });
        max = values.reduce(function(a, b) {
          return Math.max(a, b);
        });
        return [min, max];
      };

      CitiesView.prototype.showDetail = function(city, dot) {
        var r, rendered, x, y, yOffset, _ref, _ref2;
        this.cityDetail = new CityDetail({
          model: city
        });
        rendered = this.cityDetail.render().el;
        $(this.parentView.el).append(rendered);
        _ref = $(dot).offset(), x = _ref.left, y = _ref.top;
        r = Math.ceil($(dot).attr('r'));
        _ref2 = [x + r, y + r], x = _ref2[0], y = _ref2[1];
        yOffset = r + $(rendered).outerHeight() + 10;
        $(rendered).css("top", y - yOffset);
        $(rendered).css("left", x - ($(rendered).outerWidth() / 2));
        $(rendered).addClass($(dot).attr('class'));
        return $(rendered).fadeIn('fast');
      };

      CitiesView.prototype.hideDetail = function(city) {
        return $(this.cityDetail.el).fadeOut('fast', function() {
          return $(this).remove();
        });
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
        var height, width;
        _.bindAll(this);
        this.viewLayers = [];
        this.projection = d3.geo.mercator().scale(1).translate([0, 0]);
        this.path = d3.geo.path().projection(this.projection);
        width = $(this.el).width() || $(window).width();
        height = $(this.el).height() || $(window).height();
        this.map = d3.select("#" + $(this.el).attr('id')).append("svg:svg").attr("height", "100%").attr("width", "100%").attr("viewBox", "0 0 " + width + " " + height);
        this.world = this.map.append("svg:g").attr("id", "world");
        this.scaleWorldMap([width, height]);
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

      WorldView.prototype.scaleWorldMap = function(_arg) {
        var bounds, bounds0, height, scale, width, xscale, yscale;
        width = _arg[0], height = _arg[1];
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