function navigate_to(obj) {
	var targetPanel = target_panel_obj(obj);
	var currentNavigator = $(".list-item.item-selected > span");
	var currentPanel = target_panel_obj(currentNavigator)
	if (is_selecting_current(targetPanel, currentPanel)) {
		return;
	}
	$('#title').html(obj.html());
	to_hide(currentNavigator, currentPanel, 'item-selected')
	to_show(obj,targetPanel,'item-selected')
}

function target_panel_obj(span) {
	var id = $(span).attr('id');
	var toOpen = id.replace('open-', "")
	return $("#" + toOpen);
}
function to_hide(currentNavigator, currentPanel, css) {
	currentNavigator.parent().removeClass(css)
	$(currentPanel).hide()
}

function to_show(targetNavigator,targetPanel,css, direction) {
	targetNavigator.parent().addClass(css)
	if(!direction) {
		direction = "right";
	}
	$(targetPanel).show('slide', {direction: direction}, 200)
}

function is_selecting_current(current, target) {
	return current.attr('id') == target.attr('id')
}

function switch_to_group(obj) {
	var targetPanel = target_panel_obj(obj);
	var currentNavigator = $(obj).parent().parent().find(".sub-tab-button-active > span" );
	var currentPanel = target_panel_obj(currentNavigator)
	if (is_selecting_current(targetPanel, currentPanel)) {
		return;
	}
	to_hide(currentNavigator, currentPanel,"sub-tab-button-active")
	var direction = slide_moving_direction($(obj).parent().parent(), currentNavigator, obj, ".sub-tab-button");
	to_show(obj, targetPanel,"sub-tab-button-active", direction)
}

function slide_moving_direction(parent, currentElem, targetElem, select) {
	var current = index_in_scople(parent, currentElem,select)
	var target  = index_in_scople(parent, targetElem, select)

	return current > target ? "left" : "right";
}

function index_in_scople(parent, current_elem, select) {
	var array = $(parent).find(select);
	var length = array.length;
	for (var i = 0; i < length; i++) {
		if($(array[i]).attr("id") == current_elem.attr("id")) {
			return i;
		}
	}
	return -1;
}

function import_candidates(data_from, groupsCount){
	if (data_from.trim() == "") {
		return;
	}

	getLocalStorage().setItem('groupsCount', groupsCount);

	var candidates = new Candidates(groupsCount)
	candidates.fromCSV(data_from)
	candidates.persist();
	candidates.render();
	init_pages();
}

function init_pages() {
	$(".sub-tab-button-container").click(function(){
		switch_to_group($(this).find('.sub-tab-button'));
	});
	// let the gallery items be draggable
	$(".candidate").draggable({
		revert: "invalid", // when not dropped, the item will revert back to its initial position
		helper: "clone",
		cursor: "move"
	});
	// let the trash be droppable, accepting the gallery items
	$(".grade").droppable({
			accept: ".candidate",
			activeClass: "ui-state-highlight",
			drop: function( event, ui ) {
				var candidates = new Candidates(getLocalStorage().getItem('groupsCount'));
				candidates.load()
				candidates.rank(ui.draggable,$(this));
			}
	});
}

function export_candidates(data_to){
	var candidates = new Candidates(getLocalStorage().getItem('groupsCount'))
	candidates.load();
	data_to.val(candidates.export_as())
}

function statistic_draw() {
	var candidates = new Candidates(getLocalStorage().getItem('groupsCount'));
	candidates.load();

	var diversityPie = new RGraph.Pie('diversity-chart-canvas', [candidates.females_amount(),candidates.males_amount()]);
	var females_label = candidates.females_percentage() + "%";
	var male_label = candidates.males_percentage() + "%";

	diversityPie.Set('chart.labels', ['Female (' + females_label + ')', 'Male (' + male_label + ')']);
	diversityPie.Set('chart.gutter', 30);
	diversityPie.Set('chart.shadow', false);
	diversityPie.Set('chart.tooltips.effect', 'contract');
	diversityPie.Set('chart.tooltips', [
		candidates.females_amount() + ' of ' + candidates.size(),
		candidates.males_amount() + ' of '  + candidates.size(),
	]);
	diversityPie.Set('chart.highlight.style', '3d');
	diversityPie.Set('chart.zoom.hdir', 'center');
	diversityPie.Set('chart.zoom.vdir', 'up');
	diversityPie.Set('chart.labels.sticks', true);
	diversityPie.Set('chart.labels.sticks.color', '#aaa');
	diversityPie.Set('chart.contextmenu', [['Zoom in', RGraph.Zoom]]);
	diversityPie.Set('chart.linewidth', 5);
	diversityPie.Set('chart.labels.sticks', true);
	diversityPie.Set('chart.strokestyle', 'transparent');
	diversityPie.Set('chart.colors', ["pink", "#CCF"]);
	diversityPie.Draw();
}

function load_group_count() {
	var groupsCount = getLocalStorage().getItem('groupsCount');
	if (groupsCount == null) {
		getLocalStorage().setItem('groupsCount', $("#groups-count").val());
	} else {
		$("#groups-count").val(groupsCount);
	}
}