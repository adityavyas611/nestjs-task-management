import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { timeStamp } from 'console';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>
  ){}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });

    if(status){
      query.andWhere('task.status = :status', { status });
    }

    if(search){
      query.andWhere('(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE LOWER(:search))',
      {search: `%${search}%`},
      )
    }
    try{
      const tasks = await query.getMany();
      return tasks;
    } catch(error){
      this.logger.error(`Failed to get tasks for User : "${user.username}. Filters: ${JSON.stringify(filterDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: {id, user}});
    if(!found){
      this.logger.error(`Failed to get task by Id for User : "${user.username}. Filters: ${JSON.stringify(id)}`);
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description} = createTaskDto;

    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user
    });

    await this.tasksRepository.save(task);
    return task;
  }

  async deleteTaskById(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({id, user});
    if(result.affected === 0){
      this.logger.error(`Failed to delete task by Id for User : "${user.username}. Filters: ${JSON.stringify(id)}`);
      throw new NotFoundException(`Task wih ID ${id} not found!`);
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.tasksRepository.save(task);

    return task;
  }
}
