provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region = "us-east-1"
}

data "aws_availability_zones" "all" {}

resource "aws_launch_configuration" "toonin_backend_config" {
  image_id = "ami-0b69ea66ff7391e80"
  instance_type = "t2.micro"
  security_groups = ["toonin_rules"]
  depends_on = ["aws_security_group.toonin_rules"]

  user_data = <<-EOF
              #!/bin/bash
              mkdir /home/backend
              mkdir /home/app
              curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
              export NVM_DIR="$HOME/.nvm"
              [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
              nvm install 10.15.3
              cd /home/backend
              aws configure set aws_access_key_id "${var.access_key}"
              aws configure set aws_secret_access_key "${var.secret_key}"
              aws configure set default_region_name "us-east-1"
              aws s3 cp s3://toonin-server-src/backend.zip ./backend.zip
              unzip backend.zip
              sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3000
              sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
              sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 8443 -j REDIRECT --to-port 8100
              NODE_ENV=production node index.js & disown
              cd /home/app
              aws s3 cp s3://toonin-server-src/app.zip ./app.zip
              unzip app.zip
              wait
              NODE_ENV=production node server.js
              EOF
  
  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "toonin-backend-autoscaler" {

  launch_configuration = "${aws_launch_configuration.toonin_backend_config.id}"
  availability_zones = ["${data.aws_availability_zones.all.names}"]

  min_size = 1
  max_size = 3

  load_balancers = ["${aws_elb.toonin-backend-elb.name}"]
  health_check_type = "ELB"

  tag {
    key = "Name"
    value = "toonin-backend"
    propagate_at_launch = true
  }
}

resource "aws_elb" "toonin-backend-elb" {

  name = "toonin-backend"
  availability_zones = ["${data.aws_availability_zones.all.names}"]
  security_groups = ["${aws_security_group.toonin_rules.id}"]
  depends_on = ["aws_security_group.toonin_rules"]

  listener {
    lb_port = 80
    lb_protocol = "tcp"
    instance_port = 80
    instance_protocol = "tcp"
  }

  listener {
    lb_port = 8443
    lb_protocol = "ssl"
    instance_port = 8443
    instance_protocol = "tcp"
    ssl_certificate_id = "arn:aws:acm:us-east-1:208677296787:certificate/8b528dba-a50d-439b-b948-3f17f02ec1de"
  }

  listener {
    lb_port = 443
    lb_protocol = "ssl"
    instance_port = 443
    instance_protocol = "tcp"
    ssl_certificate_id = "arn:aws:acm:us-east-1:208677296787:certificate/8b528dba-a50d-439b-b948-3f17f02ec1de"
  }
  
  health_check {
    healthy_threshold = 2
    unhealthy_threshold = 2
    timeout = 3
    interval = 10
    target = "HTTP:443/"
  }
}

resource "aws_security_group" "toonin_rules" {
  name        = "toonin_rules"
  description = "Toonin server inbound traffic rules"
  vpc_id      = "${aws_default_vpc.default.id}"

  ingress {
      from_port   = 8443
      to_port     = 8443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}
