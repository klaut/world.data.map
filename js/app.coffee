jQuery ->
	
	class City extends Backbone.Model

	class CityDetail extends Backbone.View
		tagName: 'div'
		className: 'city-detail'
		template: _.template($('#city-detail-tmp').html())

		initialize: ->
			_.bindAll @
		
		render: ->
			$(@el).html(@template(@model.toJSON()))
			@

	
	class Cities extends Backbone.Collection
		model: City
	
	class CitiesView extends Backbone.View
		tagName: 'g'

		initialize: ->
			_.bindAll @

			@parentView = @options.parentView
			@el = @parentView.map.append("svg:g").attr("id", "cities-#{@className}")

			@collection = new Cities
			@collection.reset @options.collectionData

			@render()
		
		render: ->
			r = d3.scale.linear().domain(@getDataMinMax()).range([3,20])
			projection = @parentView.projection
			self = @
			
			@el.selectAll("circle")
				.data( @collection.models )
				.enter().append("svg:circle")
				.attr("class", @className )
				.attr("id", (d) -> d.cid )
				.attr("r", (d) -> r(d.get 'value') )
				.attr("cx", (d) -> projection([d.get('longitude'), d.get('latitude')])[0] )
				.attr("cy", (d) -> projection([d.get('longitude'), d.get('latitude')])[1] )
				.on("mouseover", (d) -> self.showDetail(d, @))
				.on("mouseout", (d) -> self.hideDetail(d, @))
			
			@
		
		getDataMinMax: ->
			values = @collection.pluck 'value' #get all value properties from models
			min = values.reduce (a,b) -> Math.min a,b
			max = values.reduce (a,b) -> Math.max a,b
			[min,max]
		
		showDetail: (city, dot) ->		
			@cityDetail = new CityDetail model:city
			rendered = @cityDetail.render().el
			$(@parentView.el).append rendered

			{left:x, top:y} = $(dot).offset()
			r = (Math.ceil $(dot).attr('r'))
			[x,y] = [x+r, y+r]
			yOffset = r + $(rendered).outerHeight() + 10

			$(rendered).css("top", y - yOffset)
			$(rendered).css("left", x - ($(rendered).outerWidth()/2))
			$(rendered).addClass $(dot).attr('class')

			$(rendered).fadeIn('fast')
		
		hideDetail: (city) ->
			$(@cityDetail.el).fadeOut( 'fast', -> $(@).remove() )


	class WorldView extends Backbone.View
		el: $ '#map'

		geojson_paths: world_countries

		initialize: ->
			_.bindAll @

			@viewLayers = []

			@projection = d3.geo.mercator().scale(1).translate([0, 0])
			@path = d3.geo.path().projection(@projection)

			width = $(@el).width() or $(window).width()
			height = $(@el).height() or $(window).height()

			@map = d3.select("#" + $(@el).attr('id')).append("svg:svg")
							.attr("height","100%") 
    						.attr("width","100%") 
    						.attr("viewBox","0 0 #{width} #{height}")
			@world = @map.append("svg:g").attr("id", "world")

			@scaleWorldMap([width, height])

			@render()
		
		render: -> 
			features = @world.selectAll('path');
			features.data(@geojson_paths.features)
			    .enter().append('svg:path')
			      .attr('id', (d) -> d.id )
			      .attr('d', @path)
			      .append('svg:title')
			      .text((d) -> d.properties.name )
			@
		
		addViewLayer: (data, viewClass, cssClass) ->
			view = new viewClass collectionData:data, parentView:@, className:cssClass
			@viewLayers.push view
		
		scaleWorldMap: ([width, height])->
			bounds0 = d3.geo.bounds(@geojson_paths)
			bounds = bounds0.map(@projection)
			xscale = width/Math.abs(bounds[1][0] - bounds[0][0])
			yscale = height/Math.abs(bounds[1][1] - bounds[0][1])
			scale = Math.min(xscale, yscale)

			@projection.scale(scale)
			@projection.translate(@projection([-bounds0[0][0], -bounds0[1][1]]))
		

	#dont let it go to the backend
	Backbone.sync = (method, model, success, error) ->
		success()

	worldMap = new WorldView
	worldMap.addViewLayer(cities1, CitiesView, "firstLayer")
	worldMap.addViewLayer(cities2, CitiesView, "secondLayer")
