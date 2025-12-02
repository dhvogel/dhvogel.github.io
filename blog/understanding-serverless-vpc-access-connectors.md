# Understanding GCP Serverless VPC Access

When I joined the GCP Serverless engineering team in October of 2019, I was assigned to a relatively small part of the system called "Serverless VPC Access" (or sometimes, Serverless VPC Access *Connectors*). For some fleeting and blissful time I had no idea what this component did or what purpose it served. Because this team turned over frequently, I found it hard to find someone with the full context. Over time, I pieced together bits of this story until I had something that made sense to me. This is that story.

## What Serverless VPC Access Connectors Do

Serverless VPC Access Connectors allow you to call a public Cloud Run service, and have that service connect to private data, while keeping all packets within Google's network. Prior to VPC Access, you had a Cloud Run service, you had a CloudSQL or similar database in the VPC, and in order to get the Cloud Run Service to access the database, you had to expose the database publicly and then tell Cloud Run to access it like any other public endpoint.

<div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0;">
  <img src="../images/pre-vpcaccess.png" alt="Cloud Run accessing CloudSQL before VPC Access" style="max-width: 100%; height: auto; border: 1px solid #ddd;">
  <p style="margin-top: 0.5rem; color: #666; font-size: 0.95rem; text-align: center;">Prior to VPC Access</p>
</div>

Of course, Google added some special protections for this kind of connection, e.g. [Authorized Networks](https://docs.cloud.google.com/sql/docs/mysql/authorize-networks), but in general companies didn't opening a new attack vector to their private data, because it could violate policy around security posture, either internal or external (e.g. HIPAA/PCI).

So this component of the system, while relatively small, was hugely important to the organization, because it supported workloads specifically for the largest customers who had the most sensitive data. I did not know this from the start.

## VPC Access Part I

VPC Access is really a chain of components internal to Google that takes VPC and forwards packets to that VPC through a path that is all Google-owned. This includes provisioning secret infrastructure in the VPC that the customer doesn't know about.

<div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0;">
  <img src="../images/vpcaccess.png" alt="Cloud Run accessing CloudSQL before VPC Access" style="max-width: 100%; height: auto; border: 1px solid #ddd;">
  <p style="margin-top: 0.5rem; color: #666; font-size: 0.95rem; text-align: center;">VPC Access</p>
</div>

