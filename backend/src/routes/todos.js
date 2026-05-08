const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getRepo } = require("../storage/repo");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const repo = getRepo();
    const todos = await repo.listTodos(req.user.id);
    return res.json(todos);
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body || {};
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle) return res.status(400).json({ error: "title is required" });

    const repo = getRepo();
    const todo = await repo.createTodo(req.user.id, cleanTitle);
    return res.status(201).json(todo);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { title, completed } = req.body || {};
    const repo = getRepo();
    const result = await repo.updateTodo(req.user.id, req.params.id, { title, completed });

    if (result.notFound) return res.status(404).json({ error: "Todo not found" });
    if (result.badTitle) return res.status(400).json({ error: "title cannot be empty" });
    return res.json(result.todo);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const repo = getRepo();
    const result = await repo.deleteTodo(req.user.id, req.params.id);

    if (result.notFound) return res.status(404).json({ error: "Todo not found" });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
