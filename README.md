# Lambda에서 Parquet 파일 읽기

여기서는 wrangler를 이용하여 Lambda에서 Parquet 파일을 읽는 예제를 보여줍니다.

아래와 같이 Cloud9에서 다수의 parquet 파일들을 S3에 복사합니다. 파일이 S3에 들어갈때 발생하는 putEvent를 중복없이 안정적으로 처리하기 위하여 SQS (FIFO)에 넣습니다. 이후, SQS에서 event가 발생하면 Lambda에서 S3에 파일을 로드하여 로그로 내용을 표시합니다.

![image](https://github.com/kyopark2014/reading-parquet-in-lambda/assets/52392004/4ede335f-5d0f-4208-910e-be024c154ac7)

## 설치 방법

## 시험 방법

## 시험 결과
