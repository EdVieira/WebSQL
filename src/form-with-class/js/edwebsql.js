/*
MIT License

Copyright (c) 2020 Eduardo Henrique Vieira dos Santos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
class MyWebSql{
	constructor(db='mydb', version='1.0', title='TestDB', size=2*1024*1024){
	this.db = openDatabase(db, version, title, size);
	this.tables = new Map();
	}
	createTable (table, columnsstring){
		let res = [];
		let aux = this;
		this.db.transaction(function (tx) {
			if(!aux.tables.has(table)){
				aux.tables.set(table, columnsstring);
			}
			res = tx.executeSql('CREATE TABLE IF NOT EXISTS '+table+
				' (id INTEGER PRIMARY KEY,'+columnsstring+')');
			// CREATE TABLE IF NOT EXISTS LOGS (id unique, log)
		});
		console.log(res);
		return res;
	}
	dropTable (table) {
		let res = [];
		this.createTable(table);
		this.db.transaction(function (tx) {
			res = tx.executeSql('DROP TABLE IF EXISTS '+table);
		});
		console.log(res);
		return res;
	}
	dbInsert (table, columns, values){
		let res = [];
		this.createTable(table, columns);
		//values[0] = int(id)+1;
		this.db.transaction(function (tx) {
			// table
			let query =	'INSERT INTO '+table+' (';
			// columns
			for(let i = 0; i < columns.length; i++){
				query+= columns[i]
				if(i != columns.length-1){
					query+=',';
				}else{
					query+=') VALUES ("';
				}
			}
			// values
			for(let i = 0; i < values.length; i++){
				query+= values[i]
				if(i != values.length-1){
					query+='","';
				}else{
					query+='");';
				}
			}
			res = tx.executeSql(query);
		});
		console.log(res);
		return res;
	}
	dbUpdate (table, columns, values, where=''){
		let res = []
		this.createTable(table, columns);
		//values[0] = int(id)+1;
		if(where != ''){
			this.db.transaction(function (tx) {
				// table
				/*
				UPDATE table_name
				SET column1 = value1, column2 = value2, ...
				WHERE condition;*/
				let query =	'UPDATE '+table+' SET ';
				// columns
				for(let i = 0; i < columns.length; i++){
					query+= columns[i]+' = "'+values[i]
					if(i != columns.length-1){
						query+='" , ';
					}else{
						query += '" WHERE '+where+' ;';
					}
				}
				res = tx.executeSql(query);
			})
		}
		console.log(res);
		return res;
	}
	dbSelect (table, content = '*', where='',orderby=['','asc'], page=0, pagesize=0){
		let res = [];
		this.createTable();
		let query = 'SELECT '+content+' FROM '+table;
		if(where != ''){
			query += ' WHERE '+where+' ';
		}
		if(orderby[0] != ''){
			query += 'ORDER BY'+orderby[0]+' '+	orderby[1]+' ';
		}
		if(pagesize>0){
			/*OFFSET @PageSize * (@PageNumber - 1) ROWS
				FETCH NEXT @PageSize ROWS ONLY;*/
			query += 'OFFSET '+pagesize+' * ('+page+' - 1) ROWS ';
			query += 'FETCH NEXT '+pagesize+' ROWS ONLY ';	
		}
		this.db.transaction(function (tx) {
			tx.executeSql(query, [], function (tx, results) {
				var len = results.rows.length;
				for (let i = 0; i < len; i++) {
					res[i] = results.rows.item(i);
				}
			}, null);
		});
		console.log(res);
		return res;
	}
	dbDelete (table, where=''){
		let res = [];
		if(where != ''){
			this.createTable();
			//DELETE FROM table_name WHERE condition;
			let query = 'DELETE FROM '+table+' WHERE '+where;
			this.db.transaction(function (tx) {
				res = tx.executeSql(query);
			});
		}
		console.log(res);
		return res;
	}
}