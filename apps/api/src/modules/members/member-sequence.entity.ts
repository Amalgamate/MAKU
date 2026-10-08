import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('member_sequences')
export class MemberSequence {
  @PrimaryColumn({ type: 'int' })
  year!: number;

  @Column({ name: 'next_val', type: 'int', default: 1 })
  nextVal!: number;
}
