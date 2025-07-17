import { of } from 'rxjs';
import { MilestoneAnomaliesStatus } from '../../src/app/core/constants/milestone-anomalies.constants';
import { MilestoneAnomaly } from '../../src/app/core/models/milestone-anomaly.model';
import { Milestone } from '../../src/app/core/models/milestone.model';
import { GithubService } from '../../src/app/core/services/github.service';
import { MilestoneService } from '../../src/app/core/services/milestone.service';
import {
  MILESTONE_WITHOUT_DEADLINE_DATA,
  MILESTONE_WITH_FUTURE_DEADLINE_DATA,
  MILESTONE_WITH_PAST_DEADLINE_DATA
} from '../constants/milestone.constants';

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

  describe('MilestoneService: getMilestoneAnomalies()', () => {
    it('should return milestones with no deadline as anomalies', (done) => {
      const mockMilestones = [MILESTONE_WITHOUT_DEADLINE_DATA, MILESTONE_WITH_FUTURE_DEADLINE_DATA];
      githubServiceSpy.fetchAllMilestones.and.returnValue(of(mockMilestones));

      const expectedAnomaly: MilestoneAnomaly = new MilestoneAnomaly(
        milestoneService.parseMilestoneData([MILESTONE_WITHOUT_DEADLINE_DATA])[0],
        MilestoneAnomaliesStatus.NoDeadline
      );

      milestoneService.fetchMilestones().subscribe((response) => {
        expect(githubServiceSpy.fetchAllMilestones).toHaveBeenCalled();
        expect(milestoneService.milestones.length).toBe(2);
        expect(milestoneService.getMilestoneAnomalies()).toEqual([expectedAnomaly]);

        done();
      });
    });

    it('should return milestones that have gone past deadline', (done) => {
      const mockMilestones = [MILESTONE_WITH_PAST_DEADLINE_DATA, MILESTONE_WITH_FUTURE_DEADLINE_DATA];
      githubServiceSpy.fetchAllMilestones.and.returnValue(of(mockMilestones));

      const expectedAnomaly: MilestoneAnomaly = new MilestoneAnomaly(
        milestoneService.parseMilestoneData([MILESTONE_WITH_PAST_DEADLINE_DATA])[0],
        MilestoneAnomaliesStatus.PastDeadLine
      );

      milestoneService.fetchMilestones().subscribe((response) => {
        expect(githubServiceSpy.fetchAllMilestones).toHaveBeenCalled();
        expect(milestoneService.milestones.length).toBe(2);
        expect(milestoneService.getMilestoneAnomalies()).toEqual([expectedAnomaly]);

        done();
      });
    });
  });
});
