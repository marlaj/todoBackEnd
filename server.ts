import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const saltRounds = 10;

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;
const bcrypt = require('bcrypt');

app.use(express.json());

//register
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(200).json({ message: 'Registration successful', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

//login
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if email exists and password matches
    const validUser = await prisma.user.findFirst({
      where: {
        email: email,
      }, 
    });

    if (!validUser) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, validUser.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // The email and password are valid
    res.status(200).json({ message: 'Login successful', user: validUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

//retrieve tasks
app.post('/tasks', async (req, res) => {
  const { email } = req.body;

  try {
    // Retrieve the user's tasks based on the email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        tasks: {
          where: {
            completed: false
          },
          select: {
            title: true
          }
        }
      },
    });

    if (user) {
      const tasks = user.tasks.map((task) => task.title);
      res.status(200).json({ tasks: tasks });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//retreive comps
app.post('/comps', async (req, res) => {
  const { email } = req.body;

  try {
    // Retrieve the user's tasks based on the email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        tasks: {
          where: {
            completed: true
          },
          select: {
            title: true
          }
        }
      },
    });

    if (user) {
      const tasks = user.tasks.map((task) => task.title);
      res.status(200).json({ tasks: tasks });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//add task
app.post('/addtasks', async (req: Request, res: Response) => {
  const { email, task } = req.body;

  try {
    // Retrieve the user based on the email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      // Create a new task associated with the user
      const createdTask = await prisma.task.create({
        data: {
          title: task,
          completed: false,
          userId: user.id,
        },
      });

      res.status(200).json({ success: true, taskId: createdTask.id });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//complete task
app.post('/tasks/complete', async (req, res) => {
  const { email, taskText } = req.body;

  try {
    // Find the user based on the email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      // Find the task for the user with the specified task text
      const task = await prisma.task.findFirst({
        where: {
          userId: user.id,
          title: taskText,
        },
      });

      if (task) {
        // Update the task status to completed
        const updatedTask = await prisma.task.update({
          where: {
            id: task.id,
          },
          data: {
            completed: true,
          },
        });

        res.status(200).json({ message: 'Task marked as complete' });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//delete task
app.post('/deleteTask', async (req, res) => {
  const { email, taskText } = req.body;

  try {
    // Retrieve the user based on the provided email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      // Find the task to be deleted
      const task = await prisma.task.findFirst({
        where: {
          userId: user.id,
          title: taskText,
        },
      });

      if (task) {
        // Delete the task
        await prisma.task.delete({
          where: {
            id: task.id,
          },
        });

        res.status(200).json({ message: 'Task deleted successfully' });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
