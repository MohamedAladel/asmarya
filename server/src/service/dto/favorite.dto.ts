/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiProperty } from '@nestjs/swagger';
import { BaseDTO } from './base.dto';

import { LearnerDTO } from './learner.dto';
import { BookDTO } from './book.dto';
import { CourseDTO } from './course.dto';

/**
 * A FavoriteDTO object.
 */
export class FavoriteDTO extends BaseDTO {
  @ApiProperty({ type: () => LearnerDTO, description: 'learner relationship' })
  learner: LearnerDTO;

  @ApiProperty({ type: () => BookDTO, description: 'book relationship' })
  book: BookDTO;

  @ApiProperty({ type: () => CourseDTO, description: 'course relationship' })
  course: CourseDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
