# Why Serverless VPC Access exists

When I joined the GCP Serverless engineering team in October of 2019, I was assigned to a relatively small part of the system called "Serverless VPC Access" (or sometimes, Serverless VPC Access *Connectors*). For some fleeting and blissful time I had no idea what this component did or what purpose it served. Because this team turned over frequently, I found it hard to find someone with the full context. Over time, I pieced together bits of this story until I had something that made sense to me. This is that story.

## Before Serverless VPC Access Connectors

Serverless VPC Access Connectors allow you to call a public Cloud Run service, have that service connect to private data, while keeping all packets within Google's network. Prior to VPC Access, you had a Cloud Run service, you had a CloudSQL or similar database in the VPC, and in order to get the Cloud Run Service to access the database, you had to expose the database publicly and then tell Cloud Run to access it like any other public endpoint.

<div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0;">
  <img src="../images/pre-vpcaccess.png" alt="Cloud Run accessing CloudSQL before VPC Access" style="max-width: 100%; height: auto; border: 1px solid #ddd;">
  <p style="margin-top: 0.5rem; color: #666; font-size: 0.95rem; text-align: center;">Prior to VPC Access</p>
</div>

Of course, Google added some special protections for this kind of connection, e.g. [Authorized Networks](https://docs.cloud.google.com/sql/docs/mysql/authorize-networks), but in general companies didn't like exposing their database to the public internet, because this new attack vector could violate policy around security posture, either internal or external (e.g. HIPAA/PCI).

So this part of the system, while relatively small, was hugely important to the Serverless organization, because it supported workloads specifically for the largest customers who had the most sensitive data. This was an example of something that I did not know from the start.

## VPC Access Part I

VPC Access is really a chain of components internal to Google that forwards packets from Cloud Run App to a VPC through a path that is all Google-owned. This includes provisioning *secret infrastructure* in the customer's VPC that the customer doesn't know about (shhhh...).

<div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0;">
  <img src="../images/vpcaccess.png" alt="Cloud Run accessing CloudSQL with VPC Access" style="max-width: 100%; height: auto; border: 1px solid #ddd;">
  <p style="margin-top: 0.5rem; color: #666; font-size: 0.95rem; text-align: center;">VPC Access</p>
</div>

Note that the infrastructure in the VPC ("<2>") is a NAT that makes it look like the traffic originates in the VPC from the Database's perspective. This solves the problem of exposing the database publicly, and opsec teams can write security rules that just include the IP range that is reserved for the connector.

One quirk of this setup is that the customer provisions a "connector", where a "connector" is really a set of resources that includes a managed instance group running a NAT in the VPC. This underlying infrastructure is hidden from the customer in a really hacky way (a regex for a special instance name prefix in the front end) because of decisions that happened before I joined the team, and this design decision made it really frustrating for the customer to debug when the connector broke. The customer, for example, couldn't see that CPU utilization of underlying compute was maxxed out because they couldn't see the underlying compute instances. I think this design choice greatly increased the support load on the team and contributed to the frequent team turnover. But to be fair, exposing the infrastructure could have had all sorts of burdens as well. 

## The next generation connector

Another part of the organization recently released Direct VPC Egress, which I believe uses some new GCE Networking functionality to obviate the need for the Connector (but not the need for the Private IP addresses). I wasn't involved in that effort so I don't know the new architecture. But if I had to guess, I think it would look something like this:

<div style="display: flex; flex-direction: column; align-items: center; margin: 2rem 0;">
  <img src="../images/vpcaccess.png" alt="Cloud Run accessing CloudSQL post VPC Access" style="max-width: 100%; height: auto; border: 1px solid #ddd;">
  <p style="margin-top: 0.5rem; color: #666; font-size: 0.95rem; text-align: center;">Post VPC Access Connectors</p>
</div>

A couple reddit posts say it works pretty well. Good job team!

## Reflecting on my time on VPC Access

This was certainly the most challenging team in the Serverless organization to be on, and I think this is part of the reason that I was selected for it. I made it clear that I wanted to have impact early on. And they gave me the opportunity to do so as my first project was to write the control plane for VPC Access for Cloud Run, which I now realize was a massive contribution for an L3. In addition, I was also willing to staff the 24/7 oncalls, I later found that most other Serverless components had SRE teams that took the pager at night, but not VPC Access. We just had our own grit and can-do attitudes.

But this was a great project to work on when I did. I felt that I learned tremendously from this experience, in many different dimensions. I learned how to work under pressure, I learned how to write code that is at or above the Google quality bar, I learned how to prioritize work, how to manage relationships. I am very grateful for this experience and part of this blog post is to try to convey that to whoever is reading.