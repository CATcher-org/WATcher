import { of } from 'rxjs';
import { Milestone } from '../../src/app/core/models/milestone.model';
import { GithubService } from '../../src/app/core/services/github.service';
import { MilestoneService } from '../../src/app/core/services/milestone.service';

let milestoneService: MilestoneService;
let githubServiceSpy: jasmine.SpyObj<GithubService>;

describe('MilestoneService', () => {
  beforeEach(() => {
    githubServiceSpy = jasmine.createSpyObj('GithubService', ['fetchAllMilestones']);
    milestoneService = new MilestoneService(githubServiceSpy);
  });

  describe('MilestoneService: fetchMilestones()', () => {
    it('should fetch all milestones', (done) => {
      const mockMilestones = [{ title: 'Milestone 1' }, { title: 'Milestone 2' }];
      githubServiceSpy.fetchAllMilestones.and.returnValue(of(mockMilestones));
      milestoneService.fetchMilestones().subscribe((response) => {
        expect(githubServiceSpy.fetchAllMilestones).toHaveBeenCalled();
        expect(milestoneService.milestones.length).toBe(2);
        expect(milestoneService.milestones[0].title).toBe('Milestone 1');
        expect(milestoneService.hasNoMilestones).toBeFalse();

        done();
      });
    });

    it('should handle no milestones', (done) => {
      githubServiceSpy.fetchAllMilestones.and.returnValue(of([]));
      milestoneService.fetchMilestones().subscribe((response) => {
        expect(githubServiceSpy.fetchAllMilestones).toHaveBeenCalled();
        expect(milestoneService.milestones.length).toBe(0);
        expect(milestoneService.hasNoMilestones).toBeTrue();

        done();
      });
    });
  });

  describe('MilestoneService: parseMilestoneData()', () => {
    it('should parse milestone data correctly', () => {
      const mockMilestones = [{ title: 'Milestone 2' }, { title: 'Milestone 1' }];
      const parsedMilestones = milestoneService.parseMilestoneData(mockMilestones);

      for (const milestone of parsedMilestones) {
        expect(milestone).toBeInstanceOf(Milestone);
      }

      expect(parsedMilestones.length).toBe(2);
      expect(parsedMilestones[0].title).toBe('Milestone 1');
    });
  });
});
