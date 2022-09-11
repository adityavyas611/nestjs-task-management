import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    getTaskById: jest.fn()
});

const mockUser = {
    username: 'cybertron611',
    id: 'someId',
    password: 'somePassword',
    tasks: []
};

describe('Tasks Service', () => {
    let tasksService;

    beforeEach(async () => {
        //initialize a nestjs module with tasksService and Entity
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide : TasksService, useFactory: mockTaskRepository}
            ],
        }).compile();

        tasksService = await module.get(TasksService);
    });

    describe('getTasks', () => {
        it('calls TasksService.getTasks and returns the result', async() => {
            expect(tasksService.getTasks).not.toHaveBeenCalled();
            tasksService.getTasks.mockResolvedValue('someValue');
            const result = await tasksService.getTasks(null, mockUser);
            expect(tasksService.getTasks).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        });
    });

    describe('getTaskById', () => {
        it('calls TasksService.findOne and returns the result', async() => {
            const mockTask = {
                title: 'Test title',
                description: 'Test desc',
                id: 'someId',
                status: TaskStatus.OPEN
            };
            await tasksService.getTaskById.mockResolvedValue(mockTask);
            const result = await tasksService.getTaskById('someId', mockUser);
            expect(result).toEqual(mockTask);
        });

        it('calls TasksService.findOne and handles an error', async() => {
            await tasksService.getTaskById.mockResolvedValue(null);
            expect(await tasksService.getTaskById('someId',mockUser)).toEqual(null);
        });
    })
});