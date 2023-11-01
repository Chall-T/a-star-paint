
class Grid {

	constructor(row_count, column_count, cell_size) {
		this.brush_size = 1
		this.row_count = row_count;
		this.column_count = column_count;
		this.cell_size = cell_size;
		this.start_cell = [5, parseInt(this.column_count/2)];
		this.end_cell = [this.row_count-5, parseInt(this.column_count/2)];
		this.cells = [];

		this.generationId = 0

		for(var x=0; x<this.row_count; x++) {
			var row = [];
			for(var y=0; y<this.column_count; y++) {
				row.push(new Cell(x, y, cell_size))
			}
			this.cells.push(row);
		}
		this.setGridCellNeighbors()
		this.start_cell_object = this.getCell(this.start_cell[0], this.start_cell[1])
		this.end_cell_object = this.getCell(this.end_cell[0], this.end_cell[1])
	}
	setGridCellNeighbors(){
		this.cells.forEach(row =>{
			row.forEach(cell =>{
				var neighbor = this.getCell(cell.X+1, cell.Y);
				if (neighbor){ cell.neighbors.push(neighbor) }

				var neighbor = this.getCell(cell.X-1, cell.Y);
				if (neighbor){ cell.neighbors.push(neighbor) }

				var neighbor = this.getCell(cell.X, cell.Y+1);
				if (neighbor){ cell.neighbors.push(neighbor) }

				var neighbor = this.getCell(cell.X, cell.Y-1);
				if (neighbor){ cell.neighbors.push(neighbor) }
			});
		});
	}
	getCell(x, y){
		var foundCell
		if (x>=0 && y >=0&& x<this.row_count){
			
			this.cells[x].forEach(function (cell){
				if (cell.Y == y){
					foundCell = cell;
				}
			})
		}
		return foundCell;
	}
	update(mouse, ctx) {
		for(var x=0; x<this.row_count; x++) {
			for(var y=0; y<this.column_count; y++) {
				var c = this.cells[x][y];
				
				if ((c.x <= mouse.x) && (mouse.x < c.x+c.size) && 
					(c.y <= mouse.y) && (mouse.y < c.y+c.size)) {	
					c.onHover();
					displayCellIndex(x, y)

					if(mouse.isClicked)
						if (swatch.color_index == 0 || swatch.color_index == 1){
						this.midPointCircleDraw(x, y)
						}else{
							if (swatch.color_index == 2 && [x, y].toString() !== this.end_cell.toString()){
								this.cells[this.start_cell[0]][this.start_cell[1]].onClick(swatch.colors[0]);
								this.start_cell = [x, y]
								this.start_cell_object = c
								c.onClick(swatch.color);
							}
							if (swatch.color_index == 3 && [x, y].toString() !== this.start_cell.toString()){
								this.cells[this.end_cell[0]][this.end_cell[1]].onClick(swatch.colors[0]);
								this.end_cell = [x, y]
								this.end_cell_object = c
								
								c.onClick(swatch.color);
							}
						}
				}
				else c.onUnhover();

				c.draw(ctx)
			}
		}
	}
	draw_with_check(x,y, color=swatch.color){
		if (this.row_count>x && this.column_count>y && x>=0 && y>=0){
			if ([x, y].toString() === this.start_cell.toString()){
				return 0;
			}
			if ([x, y].toString() === this.end_cell.toString()){
				return 0;
			}
			this.cells[x][y].onClick(color);
		}
	}
	midPointCircleDraw(x0, y0) {
		
		this.draw_with_check(x0, y0)
		var x = this.brush_size;
		var y = 0;
		var radiusError = 1 - x;
		
		while (x >= y) {
			this.draw_with_check(x + x0, y + y0)
			this.draw_with_check(y + x0, x + y0)
			this.draw_with_check(-x + x0, y + y0)
			this.draw_with_check(-y + x0, x + y0)
			this.draw_with_check(-x + x0, -y + y0)
			this.draw_with_check(-y + x0, -x + y0)
			this.draw_with_check(x + x0, -y + y0)
			this.draw_with_check(y + x0, -x + y0)
			y++;
			
			if (radiusError < 0) {
				radiusError += 2 * y + 1;
			}
			else {
				x--;
				radiusError+= 2 * (y - x + 1);
			}
		}
		
	};

	export() {
		let arr = [];
		for(var x=0; x<this.row_count; x++) {
			for(var y=0; y<this.column_count; y++) {
				arr.push(this.cells[x][y].color);
			}
		}
		return JSON.stringify(arr);
	}

	import(data) {
		for(var x=0; x<this.row_count; x++) {
			for(var y=0; y<this.column_count; y++) {
				this.cells[x][y].color = data[x*this.row_count+y]
			}
		}
	}
	drawPath(){
		this.generationId ++;
		this.clearPath()
		var pathFinder = new FindPath(grid.start_cell_object, grid.end_cell_object)
		var path = pathFinder.getPath()
		var prePath = pathFinder.getPrePath()
		var delay = 7
		prePath.forEach(cell =>{
			if (cell != this.end_cell_object){
				//cell.onClick("#ff8c00");
				draw_delay(cell, "#ff8c00", delay, this.generationId)
				delay+=2
				
			}
		})
		path.reverse().forEach(cell =>{
			if (cell != this.end_cell_object){
				//cell.onClick("#800080");
				draw_delay(cell, "#800080", delay, this.generationId)
				delay+=2
			}
		})
	}
	clearPath(){

		this.cells.forEach(row =>{
			row.forEach(cell =>{
				if (!swatch.colors.includes(cell.color)){
					this.draw_with_check(cell.X, cell.Y, swatch.colors[0])
				}
				cell.F = 0
				cell.G = 0
				cell.H = 0
			});
		});
	}
}
async function draw_delay(cell, color, ms, generationId){
	await sleep(ms)
	if ([cell.X, cell.Y].toString() === grid.start_cell.toString()){
		return 0;
	}

	if (grid.generationId != generationId){
		return 0;
	}
	cell.onClick(color);
}
function sleep(ms) {
	// add ms millisecond timeout before promise resolution
	return new Promise(resolve => setTimeout(resolve, ms))
  }
class Cell {

	constructor(x_index, y_index, size) {
		this.padding = 0.4;
		this.size = size;
		this.x = x_index * this.size;
		this.y = y_index * this.size;
		this.X = x_index;
		this.Y = y_index
		this.color = "#ffffff"; // default is white
		this.isHovered = false;
		
		this.neighbors = []
		this.connection = null
		this.G = 0.0;
		this.H = 0.0;
		this.F = 0.0;
		this.weight = 1
		this.imapassable = false;
	}
	setH(h){this.H = h; this.F = this.H + this.G}
	setG(g){this.G = g; this.F = this.H + this.G}
	setConnection(cell){this.connection = cell}

	getDistance(cell){
		//console.log(this, cell)
		const dist = [Math.abs(this.X - cell.X), Math.abs(this.Y - cell.Y)]

		var lowest = Math.min(dist[0], dist[1]);
		var highest = Math.max(dist[0], dist[1]);

		var horizontalMovesRequired = highest - lowest;

		return lowest * 14 + horizontalMovesRequired * 10;
	}
	
	onHover() { 
		this.isHovered = true; 
	}
	onUnhover () { this.isHovered = false; }
	onClick(color) { this.color = color;}

	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x+this.padding, 
			this.y+this.padding, 
			this.size-this.padding*2, 
			this.size-this.padding*2);
		if (this.color != "#808080"){
			this.imapassable = false;
		}else{
			this.imapassable = true;
		}
		if (this.isHovered) {
			ctx.strokeStyle = "#00f";
			ctx.strokeRect(this.x, this.y, this.size, this.size);
			ctx.font = "15px Arial";
			ctx.fillStyle = "#000000";
			
			ctx.fillText(`F:${this.F}`, this.x-30, this.y-10);
			ctx.fillText(`G:${this.G}`, this.x-30, this.y-25);
			ctx.fillText(`H:${this.H}`, this.x-30, this.y-40);
		}
		
	}
	

}

class Swatch {
	constructor(color_array) {
		this.colors = ["#ffffff", ...color_array];
		this.color_index = 0
		this.color = color_array[this.color_index];
	}

	setSwatchView() {
		var l = document.getElementsByClassName("swatch-color");
		for(let i=0; i<l.length; i++) {
			l[i].style.background = this.colors[i];
			
			// Select color event
			l[i].addEventListener("click", (e) => {
				this.color_index = i
				this.color = this.colors[i];
			});

			// Change color event
			l[i].addEventListener("contextmenu", (e) => {
				e.preventDefault();
				let _color = window
					.prompt("Enter color hex code (e.g. #fcba03):");
				
				if( !(/^#[0-9A-Fa-f]{6}$/i.test(_color) || 
					/^#[0-9A-Fa-f]{3}$/i.test(_color)) ) {
					window.alert("Invalid hex code given.")
				}
				else {
					this.color_index = i
					this.colors[i] = _color;
					this.color = this.colors[i];
					l[i].style.background = this.colors[i];
				}

			})
		}
	}
}

class FindPath {
	constructor(startCell, endCell) {
		this.startCell = startCell
		this.endCell = endCell
		this.toSearch = [this.startCell];
		this.processed = [];
		this.stop = false
	}
	getPath(){
		while (this.toSearch.length>0 && ! this.stop){
			var current = this.toSearch[0];
			this.toSearch.forEach(t => {
				if (t.F < current.F || t.F == current.F && t.H < current.H){
					current = t;
				}
			});
			this.processed.push(current);
			this.toSearch.splice(this.toSearch.indexOf(current), 1);
			//grid.draw_with_check(current.X, current.Y, "#ff8c00")
			//current.onClick("#ff8c00");

			if (current == this.endCell){
				var currentPathCell = this.endCell;
				var path = [];
				var count = 1000;
				while (currentPathCell != this.startCell){
					path.push(currentPathCell);
					currentPathCell = currentPathCell.connection
					count--;
					if (count<0) console.log('loop')
				}
				console.log(path.length)
				return path;
			}

			current.neighbors.forEach(neighbor => {
				if (!neighbor.imapassable && !this.processed.includes(neighbor)){
					var inSearch = this.toSearch.includes(neighbor);
					var cost = current.G + current.getDistance(neighbor);
					
					if (!inSearch || cost < neighbor.G){
						neighbor.setG(cost);
						neighbor.setConnection(current);

						if (!inSearch){
							neighbor.setH(neighbor.getDistance(this.endCell));
							
							this.toSearch.push(neighbor);
						}
					}
				}
			})
		}
		return null;
	}
	getPrePath(){
		return this.processed;
	}
}