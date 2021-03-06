ko.bindingHandlers.jqButton = {
    init: function(element, valueAccessor){
        var currentVal = valueAccessor();
        
    },
    update: function(element, valueAccessor){
        var currentVal = valueAccessor();
    }
 
};

ko.bindingHandlers.fadeVisible = {
		
		init: function(element, valueAccessor){},
		update: function(element, valueAccessor){
			var shouldDisplay = valueAccessor();
			shouldDisplay ? $(element).fadeIn() : $(element).hide();
		}
};

var progressBar = new BootstrapDialog({
	closable:false,
	message: 'Please Wait...'
}); 
progressBar.realize();
progressBar.getModalHeader().hide();
progressBar.getModalFooter().hide();
var todoTask = function(description,rawDate){
    var self = this; 
    self.description =  ko.observable( description );
    self.done = ko.observable(false);
    self.favorite = ko.observable(false);
    self.note = ko.observable('');
    self.rawCompleteDate = ko.observable();
    self.date = ko.computed(function(){
        var day = rawDate.getDate();
        var month = rawDate.getMonth()+1;
        var year = rawDate.getFullYear();
        var dateFull = month + '/' + day + '/' + year;
        return dateFull;
    });
    self.completeDate = ko.computed(function(){
    	
    	if(!self.rawCompleteDate())
    		return;
    	
        var day = self.rawCompleteDate().getDate();
        var month = self.rawCompleteDate().getMonth()+1;
        var year = self.rawCompleteDate().getFullYear();
        var dateFull = month + '/' + day + '/' + year;
        return dateFull;
    });
}

var todoTask2 = function(data){
	var self = this;
	self.id = data.id;
	self.description = data.description;
	self.task = data.task;
	self.enabled = data.enabled;
	self.note = data.note;
	self.done = ko.observable(data.done);
	self.favorite = ko.observable(data.favorite);
	self.date = new Date(data.date);
	self.computedDate = ko.computed(function(){
        var day = self.date.getDate();
        var month = self.date.getMonth()+1;
        var year = self.date.getFullYear();
        var dateFull = month + '/' + day + '/' + year;
        return dateFull;
	});
	
}

var todoController = function(name,id,event){
	var self = this;
	self.name=name;
	self.id=id;
	self.event = event;
	
	
}

var todoCategory = function(categoryName,rawDate){
	var self = this;
	self.name = categoryName;
	self.rawDate = rawDate;
    self.date = ko.computed(function(){
        var day = rawDate.getDate();
        var month = rawDate.getMonth()+1;
        var year = rawDate.getFullYear();
        var dateFull = month + '/' + day + '/' + year;
        return dateFull;
    });

	
}

/**
 * order by favorite
 */
var customPush = function(element,array){
	if(element.favorite()){
		array.unshift(element);
	}else{
		array.push(element);
	}
}

function TasksViewModel() {
    var self = this;

    self.tasks = ko.observableArray([]);
    self.subtasks = ko.observableArray([]);
    self.completeTasks = ko.observableArray([]);
    self.completeSubtasks = ko.observableArray([]);
    self.newTaskDescription = ko.observable();
    self.newSubtaskDescription = ko.observable();
    self.newCategoryName = ko.observable();
    self.categories = ko.observableArray([]);
//    Çapraz köken isteği engellendi: Aynı Köken İlkesi,
//    http://192.168.1.102:8080/TaskPaper/rest/todos/getCategories?_=1432321023986
//    üzerindeki uzak kaynağın okunmasına izin vermiyor. (Sebep: CORS üstbilgisi
//    'Access-Control-Allow-Origin' eksik.)
//    var host = mobilecheck() ? "192.168.1.102" : "localhost";
    self.tasksURI = 'http://'+getBaseUrl()+':8080/TaskPaper/rest/todos';
    self.username = getCookie('username');
    self.password = getCookie('password');
    self.selectedCategoryName = ko.observable();
    self.selectedCategory= ko.observable();
    self.selectedController = ko.observable();
    self.selectedTask = ko.observable('');
    self.selectedNote= ko.observable('');
    self.handleError = function(jqXHR){
         console.log("ajax error " + jqXHR.status);
//         for(var props in jqXHR){
//        	self.error(self.error()+"__"+props); 
//         }
         if(jqXHR.status == 401){
        	 location.href = "login.html";
         }
         if(jqXHR.status == 0){
        	 //handle CORS
//            self.tasksURI = 'http://localhost:8080/TaskPaper/rest/todos';
//        	setCookie('tasksUri', self.tasksURI, 30);
//        	location.href='index.html';
         }
    }
    self.ajax = function(uri, method, data) {
        progressBar.open();
        var request = {
            url: uri,
            type: method,
//            contentType: "application/json",
//            accepts: "application/json",
            cache: false,
//            dataType: 'json',
            data: data,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", 
                    "Basic " + btoa(self.username + ":" + self.password));
            },
            error: function(jqXHR) {
                self.handleError(jqXHR);
            },
            complete: function(){
            	progressBar.close();
            }
        };
        return $.ajax(request);
    }

    self.getTasks = function(categoryId){
    	self.ajax(self.tasksURI+"/getByCategory/"+categoryId, 'GET').done(function(data) {
    		
    		self.tasks([]);
    		self.completeTasks([]);

    		for(var i = 0; i<data.length; i++){
    			var taskElem = new todoTask(data[i].description,new Date(data[i].date));
    			taskElem.id = data[i].id;
    			taskElem.done(data[i].done);
    			taskElem.favorite(data[i].favorite);
    			taskElem.rawCompleteDate(new Date(data[i].completeDate));
    			taskElem.note(data[i].note);
    			if(taskElem.done()){
    				self.completeTasks.push(taskElem);
    			}else{
    				self.tasks.push(taskElem);
    			}

    		}
    	});
    	
    }
    //Task functions
    self.getTasks2 = function(categoryId){
    	self.ajax(self.tasksURI+"/getByCategory/"+categoryId, 'GET').done(function(data) {
    		
    		self.tasks([]);
    		self.completeTasks([]);

    		for(var i = 0; i<data.length; i++){
    			var taskElem = new todoTask(data[i].description,new Date(data[i].date));
    			taskElem.id = data[i].id;
    			taskElem.done(data[i].done);
    			taskElem.favorite(data[i].favorite);
    			taskElem.rawCompleteDate(new Date(data[i].completeDate));
    			taskElem.note(data[i].note);
    			if(taskElem.done()){
    				self.completeTasks.push(taskElem);
    			}else{
    				self.tasks.push(taskElem);
    			}

    		}
    	});
    	
    }
    
    
    
    //Category functions

    self.gotoCategory = function(category){

      self.selectedCategoryName(category.name);
      self.selectedCategory(category);
      self.getTasks(category.name);
      self.selectedTask('');
    };
    
    self.getCategories = function(){
    	self.ajax(self.tasksURI+"/getCategories",'GET').done(function(data){
    		self.categories([]);
    		for(var i = 0; i<data.length; i++){
    			self.categories.push(data[i]);
    		}
    		if (!self.selectedCategoryName()){
    			self.gotoCategory(data[0]);
    		}
    	});
    }
    


    self.addTask = function(){
        var taskElem = new todoTask(self.newTaskDescription(),new Date());
        self.newTaskDescription('');
        taskElem.categoryName = self.selectedCategoryName();
        

    	self.ajax(self.tasksURI, 'POST',taskElem).done(function(data) {
    		if(data.id){
                taskElem.id=data.id;
                self.tasks.unshift(taskElem);
    		}
    	});
    }
    
    self.addSubtask = function(){
    	var subTaskElem = new todoTask(self.newSubtaskDescription(),new Date());
    	self.newSubtaskDescription('');
    	subTaskElem.taskId = self.selectedTask().id;
    	self.ajax(self.tasksURI+"/subtask",'POST',subTaskElem).done(function(data){
    		if(data.id){
    			subTaskElem.id = data.id;
    			self.subtasks.unshift(subTaskElem);
    		}
    	});
    	
    }
    
    self.addCategory = function(){
    	var categoryElement = new todoCategory(self.newCategoryName(), new Date());
    	self.newCategoryName("");
    	self.ajax(self.tasksURI+"/category",'POST',categoryElement)
    	.done(function(data){
    		categoryElement.id = data.id;
    		self.categories.push(categoryElement);
    		
    	});
    	
    	
    }

    self.removeTask = function(){ 
    	var taskElem = this;
    	BootstrapDialog.confirm('Are you sure?',function(result){
    		
    		if(result){
    			if(self.selectedTask() === taskElem)
    				self.selectedTask('');

    			self.ajax(self.tasksURI+"/delete", 'POST',taskElem).done(function(data) { 
    				if(taskElem.done()){
    					self.completeTasks.remove(taskElem);
    				}else{
    					self.tasks.remove(taskElem); 
    				}
    					
    			});
    		}
    		
    	});
    

    }
    
    self.updateTaskNote = function(task){
    	self.ajax(self.tasksURI+"/note",'POST',task).done(function(){
    		
    	});
    }
    
    self.checkDone=function(){
    	var taskElem = this;
    	taskElem.rawCompleteDate(taskElem.done() ? new Date() : null);
    	if(taskElem.done()){
    		self.tasks.remove(taskElem);
    		customPush(taskElem, self.completeTasks);
    	}else{

    		self.completeTasks.remove(taskElem);
    		customPush(taskElem, self.tasks);
    		
    	}
    	self.ajax(self.tasksURI+"/complete", 'POST',taskElem).done(function(data) {
    	});
    	
    	self.selectedTask('');
            
    	return true;
    }
    
    
    self.getSubtasks = function(task){
    	self.subtasks([]);
    	self.completeSubtasks([]);
    	self.ajax(self.tasksURI + "/subtask",'GET',task).done(function(data){
    		for(var i = 0; i<data.length; i++){ 
    			var subTaskElem = new todoTask2(data[i]);
    			if(!subTaskElem.done()){ 
    				self.subtasks.push(subTaskElem);
    			}else{ 
    				self.completeSubtasks.push(subTaskElem);
    			}
    			
    		}
    		
    	});
    }
    
    self.checkSubtaskDone = function(){
    	var subtaskElem = this;
    	if(subtaskElem.done()){
    		self.subtasks.remove(subtaskElem);
    		customPush(subtaskElem,self.completeSubtasks);
    	}else{
    		self.completeSubtasks.remove(subtaskElem);
    		customPush(subtaskElem, self.subtasks);
    	}
    	
    	self.ajax(self.tasksURI+"/subtask/complete","POST",subtaskElem);
    	
    	return true;
    	
    }
    
    self.subtaskClick = function(){
    	
    }
    
    self.subtaskRatingClick = function(){
    	var elem = this;
    	elem.favorite(!elem.favorite());
    	self.ajax(self.tasksURI+'/subtask/favorite','POST',elem).done(function(data){
    		if(!elem.done() ){
    			//make first element in array
    			self.subtasks.remove(elem);
    			customPush(elem, self.subtasks);
    		}
    		
    	});
    }
    
    self.removeSubTask = function(){
    	
    	var taskElem = this;
    	BootstrapDialog.confirm('Are you sure?',function(result){
    		
    		if(result){

    			self.ajax(self.tasksURI+"/subtask/delete", 'POST',taskElem).done(function(data) { 
    				
    				if(taskElem.done()){
    					self.completeSubtasks.remove(taskElem); 
    				}else{
    					self.subtasks.remove(taskElem); 
    				}

    					
    			});
    		}
    		
    	});
    
    }

    /**
    self.categories = ["Inbox","Business"];
    self.categories.push("Work");
    self.categories.push("Food");
    self.categories.push("Logout");
    */

    self.logout = function(){
    	delCookie("username");
    	delCookie("password");
    	location.href = "login.html";
    	self.selectedController(this.name);
    }
    
    self.addNewItem = function(){
    	 BootstrapDialog.show({
    		 title: 'Add New Item',
             message: '<input type="text" class="form-control"  required autofocus data-bind="value:newCategoryName " placeholder="Add New Category" />',
             buttons: [{
                 id: 'btn-ok',   
                 icon: 'glyphicon glyphicon-check',       
                 label: 'OK',
                 cssClass: 'btn-primary', 
                 autospin: false,
                 action: function(dialogRef){    
                	 var categoryName = dialogRef.getModalBody().find('input').val();
                	 if(categoryName.length==0)
                		 return
                	 self.newCategoryName(categoryName);
                	 self.addCategory();
                     dialogRef.close();
                 }
             }]
         });
    	self.selectedController(this.name);
    }
    
    self.controllers = [];
    self.controllers.push(new todoController("Add New Item",1,self.addNewItem));
    self.controllers.push(new todoController("Logout",2,self.logout));


    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DEFAULT] = 'Information';
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_INFO] = 'Information';
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_PRIMARY] = 'Information';
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_SUCCESS] = 'Success';
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_WARNING] = 'Warning';
    BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_DANGER] = 'Danger';
    BootstrapDialog.DEFAULT_TEXTS['OK'] = 'OK';
    BootstrapDialog.DEFAULT_TEXTS['CANCEL'] = 'Cancel';
    BootstrapDialog.DEFAULT_TEXTS['CONFIRM'] = 'Confirmation';
    
    self.getCategories();

    self.ratingClick = function(){
    	var elem = this;
    	elem.favorite(!elem.favorite());
    	self.ajax(self.tasksURI+'/favorite','POST',elem).done(function(data){
    		if(!elem.done() ){
    			//make first element in array
    			self.tasks.remove(elem);
    			customPush(elem, self.tasks);
    		}
    		
    	});
    	
    }
    
    self.taskClick = function(){ 
    	if(this.description === self.selectedTask().description){
    		self.selectedTask(''); 
    	}else{ 
    		self.selectedTask(this); 
            self.getSubtasks(this);
    	}
    }
    
    self.noteClick = function(){
    	var task = self.selectedTask();
    	var tasknote = task.note() ? task.note() : ''; 
    	
    	 BootstrapDialog.show({
    		 title: 'Add Note',
             message: '<textarea class="form-control"  required autofocus data-bind="value:self.selectedNote()" placeholder="Add Note..." >'+tasknote+'</textarea>',
             buttons: [{
                 id: 'btn-ok',   
                 icon: 'glyphicon glyphicon-check',       
                 label: 'OK',
                 cssClass: 'btn-primary', 
                 autospin: false,
                 action: function(dialogRef){    
                	 var note = dialogRef.getModalBody().find('textarea').val();
                		 self.selectedTask().note(note);
                		 self.updateTaskNote(self.selectedTask());
                		 dialogRef.close();
                 }
             }]
         });
    }
    
    $("#txtNewTask").focus();
    $('[autofocus]:first').focus();
    
    self.updateCategory = function(){
    	
//    	self.categories.remove(self.selectedCategory());
    	self.selectedCategory().name=self.selectedCategoryName();
    	self.ajax(self.tasksURI+"/categoryUpdate",'POST',self.selectedCategory()).done(function(){
    		self.getCategories();
//    		self.categories.push(self.selectedCategory());
    		
    	});
    }
    
    
    self.editCategory = function(){
    	var oldCategoryName= self.selectedCategoryName();
    	 BootstrapDialog.show({
    		 title: 'Edit Category',
             message: '<form class="form-horizontal" role="form" data-bind="with:self.selectedCategory(),submit:updateCategory" ><input type="text" class="form-control"  required autofocus value="'+self.selectedCategoryName()+'" placeholder="Edit Category" /></form>',
             buttons: [{
                 id: 'btn-ok',   
                 icon: '',       
                 label: 'OK',
                 cssClass: 'btn-primary', 
                 autospin: true,
                 action: function(dialogRef){    
                	 var categoryName = dialogRef.getModalBody().find('input').val(); 
                	 if(categoryName.length==0)
                		 return;
                	 self.selectedCategoryName(categoryName);
                	 self.updateCategory(); 
                	 dialogRef.close();
                 }
             }]
         });
    	
    }
    
    self.updateTask = function(task){
    	self.ajax(self.tasksURI+"/taskUpdate",'POST',task);
    }
    
    self.editTask = function(){
    	var taskElem = this;
    	var oldTaskDescription = taskElem.description; 
    	 BootstrapDialog.show({
    		 title: 'Edit Task',
             message: '<form class="form-horizontal" role="form"  ><input type="text" class="form-control"  required autofocus value="'+taskElem.description()+'" placeholder="Edit Task" /></form>',
             buttons: [{
                 id: 'btn-ok',   
                 icon: '',       
                 label: 'OK',
                 cssClass: 'btn-primary', 
                 autospin: true,
                 action: function(dialogRef){    
                	 var newDescription = dialogRef.getModalBody().find('input').val(); 
                	 if(newDescription.length==0)
                		 return;
                	 taskElem.description( newDescription );
                	 self.updateTask(taskElem);
                	 dialogRef.close();
                 }
             }]
         });
    }
    
    self.deleteCategory = function(){
    	if(self.selectedCategoryName()=='Inbox') 
    	{ 
    		alert("You can not remove Inbox!");
    		return;
    	}
    	BootstrapDialog.confirm('Are you sure?',function(result){
    		
    		if(!result){
    			return;
    		} 
    		self.removeCategory(self.selectedCategory());
    		self.categories.remove(self.selectedCategory()); 
    		self.gotoCategory(self.categories()[0])
    		
    	});
    }
    
    self.removeCategory = function(category){
    	self.ajax(self.tasksURI+"/categoryDelete",'POST',category);
    }
    
    
    self.modalVisible = true; 
}
ko.applyBindings(new TasksViewModel());

