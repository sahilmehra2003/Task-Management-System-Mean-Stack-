const Todo = require('../models/todo.model');

exports.createTodo = async (req, res) => {
    try {
        const { title, summary, dueDate,userId } = req.body;
        if (!title || !summary || !dueDate || !userId) {
            return res.status(400).json({ error: "Fill all the fields while creating new todo" });
        }
        if (!userId) {
            return res.status(401).json({ error: "Please login before creating a new todo" });
        }

        const newTodo = await Todo.create({ title, summary, dueDate, userId });
        if (!newTodo) {
            return res.status(401).json({ error: "Error in creating new todo" });
        }

        return res.status(200).json({ success: true, data: newTodo, message: "New todo created successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while creating new todo" });
    }
};

exports.fetchAllTodos = async (req, res) => {
    try {
        const todos = await Todo.find().populate('userId','name');
        if (!todos) {
            return res.status(400).json({ error: "Error in fetching todos data" });
        }
        return res.status(200).json({ success: true, data: todos, message: "Todos fetched successfully!" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error in fetching todo data" });
    }
};

exports.fetchTodoByUserId = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({ error: "You need to login to view your todos" });
        }

        const todos = await Todo.find({ userId }).populate('userId', 'name');
        if (!todos) {
            return res.status(400).json({ error: "Error in getting todos" });
        }

        return res.status(200).json({ success: true, data: todos, message: "Todos fetched successfully for user" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while fetching todos for user" });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ error: "Id is missing to update todo" });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTodo) {
            return res.status(401).json({ error: "Can't update todo, Todo id is invalid" });
        }

        return res.status(200).json({ success: true, data: updatedTodo, message: "Todo updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while updating todo" });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ error: "Todo id not found" });
        }

        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(401).json({ error: "Please pass a valid todo id" });
        }

        return res.status(200).json({ success: true, data: deletedTodo, message: "Todo deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message, message: "Server error while deleting todo" });
    }
};

