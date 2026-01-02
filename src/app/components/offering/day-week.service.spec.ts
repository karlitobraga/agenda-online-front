import { TestBed } from '@angular/core/testing';

import { DayWeekService } from './day-week.service';

describe('DayWeekService', () => {
  let service: DayWeekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayWeekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
