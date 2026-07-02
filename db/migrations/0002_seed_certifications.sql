-- Reference data for the MVP certifications.
-- Exam format numbers per AWS official exam guides (verify before launch,
-- AWS occasionally updates duration/question counts between exam versions).

insert into certifications (id, name, code, exam_duration_minutes, exam_question_count, passing_score)
values
  ('ccp', 'AWS Certified Cloud Practitioner', 'CLF-C02', 90, 65, 700),
  ('saa', 'AWS Certified Solutions Architect - Associate', 'SAA-C03', 130, 65, 720)
on conflict (id) do nothing;
