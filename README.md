# BoschUdacity_project3

## Ensuring Quality Releases using Azure CI/CD Pipeline

### Project objectives
- 

### Status badge
![Build Status](https://dev.azure.com/odluser213065/BoschUdacity_project3/_apis/build/status/adedayoas91.BoschUdacity_project3?branchName=main)](https://dev.azure.com/odluser213065/BoschUdacity_project3/_build/latest?definitionId=1&branchName=main)

### Introduction

- This project demonstrates hands-on use of Azure DevOps CI/CD pipeline. It consists of the use of automated testing environments to ensure quality releases. Terraform is used to deploy the infrastructure in code (IaaC). Azure App Services was used to host the web application and Azure Pipelines for continuous integration, provision, build, deployment and testing of the whole framework. The automated tests run on a self-hosted Linux virtual machine (VM). UI Tests with Selenium, Integration Tests with PostMan, stress and endurance tests with  Apache JMeter were all passed using the agent created in the Linux VM. Furthermore, Azure Log Analytics workspace was employed to monitor and provide insight into the application's behaviour under load.

- Below is a flowchart showing the flow of processes in this task
<img width="833" alt="Screenshot 2022-10-16 at 18 15 44" src="https://user-images.githubusercontent.com/47278559/196046345-9445d331-4b98-4bed-9d21-ffb7298e79fc.png">

- Prerequisite
Have the following installed on the machine
1. Apache JMeter 
2. PostMan
3. Selenium
4. Azure account
5. Python

- Dependencies
For the following prerequisite to work as required, we want to make sure to install the following
1. Winzip
2. npm
3. Azure pipelines on the Linux Virtual machine
4. A self-hosted Linux agent
5. Terraform

### Getting Started
1. Fork and clone the starter repository into your local environment
2. Open the project on your favourite text editor or IDE (I used Pycharm)
3. Log into the [Azure Portal](https://portal.azure.com/) from Terminal
4. Log into [Azure DevOps](https://dev.azure.com/) and create a new Azure DevOps Organization

### Configuration and Installations
1. Terraform in Azure
- Create a Service Principal for Terraform
- Log into your Azure account by running `az login`.
- Next run `az account set --subscription="SUBSCRIPTION_ID"`to set the subscription_id to your account subscription.
- Create Service Principle with `az ad sp create-for-rbac --name ensuring-quality-releases-sp --role="Contributor" --scopes="/subscriptions/SUBSCRIPTION_ID"`. 

This command is expected to output the following credentials:
```
{
   "appId": "00000000-0000-0000-0000-000000000000",
   "displayName": "azure-cli-2017-06-05-10-41-15",
   "name": "http://azure-cli-2017-06-05-10-41-15",
   "password": "0000-0000-0000-0000-000000000000",
   "tenant": "00000000-0000-0000-0000-000000000000"
}
```

Create a `.azure_envs.sh` file inside the project directory and copy the content of the `.azure_envs.sh.template` to the newly created file. Change the parameters based on the output of the previous command. These values map to the `.azure_envs.sh` variables like so:
```
Application_Id is the `client_id`
Password is the `client_secret`
tenant is the `Tenant_id`
```

2. Configure the storage account and state backend
Follow the directives [here](https://docs.microsoft.com/en-us/azure/developer/terraform/store-state-in-azure-storage) to configure the storage account and state backend.`cd Terraform` and run `./config_storage_account.sh` and provide a resource group name with the desired location  for the resources to be hosted.

An example of this would be `./terraform/config_storage_account.sh -g "RESOURCE_GROUP_NAME" -l "LOCATION"`. This will output some parameters and the most interesting ones for our course are as listed below:
```
storage_account_name: tstate$RANDOM
container_name: tstate
access_key: 0000-0000-0000-0000-000000000000
```
Replace the `RESOURCE_GROUP_NAME` and `storage_account_name` in the [main.tf](https://github.com/adedayoas91/BoschUdacity_project3/blob/main/terraform/environment/test/main.tf) file in the environment directory and the `access_key` in the `.azure_envs.sh` script. Export `ACCESS_KEY="access_key"`
```
terraform {
    backend "azurerm" {
        resource_group_name  = "RESOURCE_GROUP_NAME"
        storage_account_name = "tstate$RANDOM"
        container_name       = "tstate"
        key                  = "terraform.tfstate"
    }
}
```
You will also need to replace the following parameters in the [azure-pipelines.yaml](https://github.com/adedayoas91/BoschUdacity_project3/blob/main/azure-pipelines.yaml) file.
```
backendAzureRmResourceGroupName: "RESOURCE_GROUP_NAME"
backendAzureRmStorageAccountName: 'tstate$RANDOM'
backendAzureRmContainerName: 'tstate'
backendAzureRmKey: 'terraform.tfstate'
````
Run `source .azure_envs.sh` to source into your local environment

3. Self-hosted Test Runner and REST API Infrastructure
> Create an SSH key for authentication to a Linux VM in Azure
To generate a public-private key pair run the following command (no need to provide a passphrase):
```
cd ~/.ssh/
ssh-keygen -t rsa -b 4096 -f az_eqr_id_rsa
```
Ensure that the keys were created by running `ls -ll | grep az_eqr_id_rsa`.

Follow the links for additional information on how to [create](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/create-ssh-keys-detailed) and [use](https://serversforhackers.com/c/creating-and-using-ssh-keys) SSH keys
> Create a Terraform variables `.tfvars` file to configure Terraform Variables
Create a terraform.tfvars file inside the [test](https://github.com/adedayoas91/BoschUdacity_project3/tree/main/terraform/environment/test) directory and copy the content of the `terraform.tfvars.template` to the newly created file. Change the parameters based on the outputs of the previous steps.

- The `subscription_id`, `client_id`, `client_secret`, and `tenant_id` can be found in the .azure_envs.sh file.
- Set your desired location and resource_group for the infrastructure.
- Ensure that the public key name `vm_public_key` is the same as the one created in step 2.1 of this guide.

> Deploy the REST API infrastructure from your local environment with Terraform with the following command `Terraform plan`. Next change directory to the test folder with `cd terraform/environments/test`. Inside this directory, initialise terraform with `terraform init` and after successful initialization, run  `terraform plan -out solution.plan` to output the solution plan. Finally, run `terraform apply "solution.plan"` to deploy the infrastructure.


If everything runs correctly you should be able to see the resources been created. You can also check the creation of the resources in the [Azure Portal](https://portal.azure.com/#blade/HubsExtension/BrowseResourceGroups) under
Home > Resource groups > "RESOURCE_GROUP_NAME"

3. Azure DevOps
Create a new Azure DevOps Project and Service Connections
- Login to [Azure DevOps](https://dev.azure.com/) and create a `New Project`
- Create a new Service Connection via Project settings > Service connections > New service connection. After successful creation, set service principal to automatic via Azure Resource Manager > Service principal (automatic)
- Select a Resource group, give the connection a name and description and `Save`.
IMPORTANT: You will need to create two service connections:

`service-connection-terraform` is created using the same resource group that you provided in step 1.2 of this guide.
`service-connection-webapp` is created using the resource group that you provided in terraform.tfvars file.
A detailed explanation of how to create a new Azure DevOps project and service connection can be found [here](https://www.youtube.com/watch?v=aIvl4NxCWwU&t=253s).

Ensure that the name of the service connections matches the names provided in the `.yaml` file. Also ensure that the webapp name matches the name provided in the `terraform.tfvars` file.

> Add the Self-hosted Test Runner to a Pipelines Environment
- Create a New Environment in Azure Pipelines. From inside your project in Azure DevOps via Pipelines > Environments > New environment
- Give the environment a name e.g. test, then select Virtual machines > Next. Choose `Linux` from the dropdown and REMEMBER to copy the Registration script
- From a local terminal connect to the Virtual Machine using the `ssh` key created earlier. The public_IP can be found in the Azure Portal under Home > Resource groups > "RESOURCE_GROUP_NAME" > "Virtual machine"
`ssh -o "IdentitiesOnly=yes" -i ~/.ssh/az_eqr_id_rsa marco@PublicIP`
- Once you are logged into the VM paste the Registration script and run it.

> Deploy a Log Analytics Workspace
- Deploy a new log analytics workspace by running the deploy_log_analytics_workspace.sh script. Make sure to set a resource group and provide a workspace name when promoted, e.g. ensuring-quality-releases-log. An example command to do this is as follows
```
cd analytics
./deploy_log_analytics_workspace.sh
```
- From a local terminal connect to the Virtual Machine as described above.
- Once logged into the VM run the following commands:
`wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh sh onboard_agent.sh -w ${AZURE_LOG_ANALYTICS_ID} -s ${AZURE_LOG_ANALYTICS_PRIMARY_KEY}`
IMPORTANT: The AZURE_LOG_ANALYTICS_ID and AZURE_LOG_ANALYTICS_PRIMARY_KEY can be found in the [Azure Portal](https://portal.azure.com/#blade/HubsExtension/BrowseResourceGroups) under:
Home > Resource groups > "RESOURCE_GROUP_NAME" > "Log Analytics workspace" > Agents management
There you will also find the command to Download and onboard the agent for Linux.

- [Collect custom logs with Log Analytics agent in Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/agents/data-sources-custom-logs)
For more information on how to create and install Log Analytic agents click the links below:

[Create a Log Analytics workspace with Azure CLI 2.0](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/quick-create-workspace-cli)
[Install Log Analytics agent on Linux computers](https://docs.microsoft.com/en-us/azure/azure-monitor/agents/agent-linux)
> Upload the public SSH key and tfvars to Pipelines Library
- Add a secure file to Azure Pipelines. From inside your project in Azure DevOps go to:
Pipelines > Library > Secure files > + Secure file
- Add the public ssh key and the `terraform.tfvars` files to the secure files library.
- Give the pipeline permissions to use the file:
`"SECURE_FILE_NAME" > Authorize for use in all pipelines`

> Creating a new Azure Pipeline
- Move into your project in Azure DevOps and create a new pipeline via Pipelines > Pipelines > Create new pipeline
- Select your project from GitHub choose `Existing Azure Pipelines YAML file`
- Select the main branch and select the path to the [azure-pipelines.yaml](https://github.com/adedayoas91/BoschUdacity_project3/blob/main/azure-pipelines.yaml) file.
- Click Continue and Run pipeline


> The result of the following is shown in the following screenshots.

<img width="1440" alt="Screenshot 2022-10-25 at 13 40 23" src="https://user-images.githubusercontent.com/47278559/197794733-1e12aacd-3851-451d-be80-b813092d730b.png">

<img width="1440" alt="Screenshot 2022-10-25 at 13 40 48" src="https://user-images.githubusercontent.com/47278559/197794759-3f49ccc2-aa2d-4f60-bb65-a04817c9e76a.png">


> Successful completion of this create the webapp which I have named `myProject3-Appservice`. A screenshot of successful creation of the webapp both in the Azure portal as well as loading the webapp URL are shown below in that order:

<img width="1440" alt="Screenshot 2022-10-25 at 13 41 57" src="https://user-images.githubusercontent.com/47278559/197794920-2edaf276-a64d-4872-81b3-36ef306063c3.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 42 33" src="https://user-images.githubusercontent.com/47278559/197794961-3c5bec65-5f15-4f6d-bf3b-fda349a1b952.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 57 55" src="https://user-images.githubusercontent.com/47278559/197795076-4a1d9252-e3fd-43a4-9869-b9c5d2de0b64.png">


> Copy the `Request URL` shown in the screenshot below to be used for the JMeter stress and endurance tests 

<img width="1440" alt="Screenshot 2022-10-25 at 13 58 11" src="https://user-images.githubusercontent.com/47278559/197795116-4dffd0ac-74c0-49d8-a82d-5759352e1516.png">

<img width="1440" alt="Screenshot 2022-10-25 at 13 58 22" src="https://user-images.githubusercontent.com/47278559/197795164-41116403-5e11-48fb-9cc8-896c174728d0.png">

<img width="1440" alt="Screenshot 2022-10-25 at 13 59 55" src="https://user-images.githubusercontent.com/47278559/197796286-e5e8418d-9999-4ca6-82b7-70ba64b575e6.png">

<img width="1440" alt="Screenshot 2022-10-25 at 14 04 54" src="https://user-images.githubusercontent.com/47278559/197796332-ec87dc19-96ce-40c9-9140-7e39ba497253.png">

<img width="1440" alt="Screenshot 2022-10-25 at 14 04 54" src="https://user-images.githubusercontent.com/47278559/197796654-c1888636-7936-43e9-8852-8b4aec32a20b.png">

<img width="1440" alt="Screenshot 2022-10-25 at 14 06 18" src="https://user-images.githubusercontent.com/47278559/197796723-f3e66686-cc18-4472-a23b-31311f02cf29.png">


> Several tests were carried out and below are screenshots of the results from Azure pipelines
<img width="1440" alt="Screenshot 2022-10-25 at 13 56 36" src="https://user-images.githubusercontent.com/47278559/197795944-a4d71078-3cce-42b3-9fdc-5f344cb76a46.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 56 49" src="https://user-images.githubusercontent.com/47278559/197795969-59bce107-6c59-455f-9758-0d8d6a4cea98.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 56 56" src="https://user-images.githubusercontent.com/47278559/197795998-0b6a09cf-ac0f-45fb-ad7b-b13479c4c6cd.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 57 05" src="https://user-images.githubusercontent.com/47278559/197796021-4274f782-fd4e-4b6d-a61b-342e54831bc5.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 57 12" src="https://user-images.githubusercontent.com/47278559/197796068-4e172304-7e68-48a7-8b9c-ef65801f5b3f.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 57 25" src="https://user-images.githubusercontent.com/47278559/197796108-f2454e0b-a601-48d4-818d-d12ec0be036d.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 57 32" src="https://user-images.githubusercontent.com/47278559/197796140-ac85aeb6-681f-4b31-b82e-a9658de699c7.png">
<img width="1440" alt="Screenshot 2022-10-25 at 13 57 46" src="https://user-images.githubusercontent.com/47278559/197796179-7bdbb114-6757-49eb-965f-fbec3a03a555.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 06 36" src="https://user-images.githubusercontent.com/47278559/197796785-ae5ae991-bebb-4db4-bc2b-8561762c746f.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 31 57" src="https://user-images.githubusercontent.com/47278559/197796881-b6ffaa30-b7c3-4d0c-9c7c-213eee1c7f6d.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 32 06" src="https://user-images.githubusercontent.com/47278559/197796926-9a54b8c3-f440-439c-b8ce-21ff3d0ea5df.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 32 18" src="https://user-images.githubusercontent.com/47278559/197796968-25eaf804-9d3e-4c82-b1ff-cc9717c11bae.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 32 26" src="https://user-images.githubusercontent.com/47278559/197797000-f5c67693-1786-4130-b394-3ed3b87cb44e.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 32 33" src="https://user-images.githubusercontent.com/47278559/197797089-2765ebb0-5023-4863-9226-5f1dca0a9d0b.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 06" src="https://user-images.githubusercontent.com/47278559/197797120-8f2eb794-c890-4a43-b72c-dbcfac1c82f0.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 14" src="https://user-images.githubusercontent.com/47278559/197797183-5758085d-5344-4f57-af83-047ca1792c03.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 19" src="https://user-images.githubusercontent.com/47278559/197797213-a590e68b-6a45-424f-b7a6-4dbc7cbbe8c4.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 29" src="https://user-images.githubusercontent.com/47278559/197797254-0375f4b4-c58a-4dab-8684-8ed07d0f4909.png">

> Also there are screenshots from the Newmann test results

<img width="1440" alt="Screenshot 2022-10-25 at 14 33 38" src="https://user-images.githubusercontent.com/47278559/197797335-e45a5dc5-8bb7-433f-bf64-8d2c9f5dbb3e.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 44" src="https://user-images.githubusercontent.com/47278559/197797379-ed6fe523-662c-44e9-9ba1-174c5f72b559.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 51" src="https://user-images.githubusercontent.com/47278559/197797440-081518a7-4531-485a-8763-9901cc089700.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 33 56" src="https://user-images.githubusercontent.com/47278559/197797490-9a1130a3-8235-41d1-9b37-ba55e8eba84f.png">


> In order to monitor the appservice usage, several alerts were created including requests and HTTP404 alerts. Procedures and screenshots from this are shown in screenshots below
<img width="1440" alt="Screenshot 2022-10-25 at 14 52 16" src="https://user-images.githubusercontent.com/47278559/197802169-b6a9e232-5782-487e-b35a-7a0a78784b00.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 55 30" src="https://user-images.githubusercontent.com/47278559/197802175-747f0c75-c5b8-41c3-adc6-741f1c5b5526.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 55 38" src="https://user-images.githubusercontent.com/47278559/197802199-901e0740-970a-4839-bf46-88f3c5b717dc.png">
<img width="1440" alt="Screenshot 2022-10-25 at 15 10 19" src="https://user-images.githubusercontent.com/47278559/197802229-7be82d7b-67ab-488b-9b6f-13407b1fb205.png">
<img width="1440" alt="Screenshot 2022-10-25 at 15 17 21" src="https://user-images.githubusercontent.com/47278559/197802266-4b5bf350-d2bf-46e2-aedb-a8e72edc9a48.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 45 15" src="https://user-images.githubusercontent.com/47278559/197798535-1c99bb68-00ec-43ee-bab6-7b207d62856c.png">
<img width="1440" alt="Screenshot 2022-10-25 at 15 56 21" src="https://user-images.githubusercontent.com/47278559/197798626-cae98214-e021-4481-b48b-9d401f38a16d.png">

> An email alert received when the appservice request crossed the threshold of 2 as well as a welcome message to the alert administrations are attached as follows 
<img width="1440" alt="Screenshot 2022-10-25 at 15 56 54" src="https://user-images.githubusercontent.com/47278559/197798694-2a8232eb-5c90-4e52-bf75-898688346cce.png">
<img width="1440" alt="Screenshot 2022-10-25 at 15 57 06" src="https://user-images.githubusercontent.com/47278559/197799053-06646764-6c54-4f93-add4-746413413891.png">
<img width="1440" alt="Screenshot 2022-10-25 at 15 57 21" src="https://user-images.githubusercontent.com/47278559/197802490-92eaaa49-8b77-4360-a9fa-5a9356edd740.png">


> The final stage of the pipeline was also completed and all tests were passed as shown below

<img width="1440" alt="Screenshot 2022-10-25 at 14 34 09" src="https://user-images.githubusercontent.com/47278559/197797580-e7c916de-2376-4369-9d3e-6e90d527c58f.png">
<img width="1440" alt="Screenshot 2022-10-25 at 14 34 16" src="https://user-images.githubusercontent.com/47278559/197797629-bdd89267-0f62-4d5f-a0d4-7a5a173bbebf.png">

> This is what the final repo looks like after updating the repo in GitHub
<img width="1440" alt="Screenshot 2022-10-25 at 16 27 43" src="https://user-images.githubusercontent.com/47278559/197801184-05bb8169-09ab-44a3-8f59-e80700cbb7e6.png">

## In the end, I ensured to delete all resources to save cost

<img width="1440" alt="Screenshot 2022-10-25 at 16 34 27" src="https://user-images.githubusercontent.com/47278559/197802886-3838025e-5563-4f39-a24f-04f9c99f6e2d.png">

### Resources
Helpful resources from Microsoft are listed below

- [Design a CI/CD pipeline using Azure DevOps](https://docs.microsoft.com/en-us/azure/architecture/example-scenario/apps/devops-dotnet-webapp)
- [Create a CI/CD pipeline for GitHub repo using Azure DevOps Starter](https://docs.microsoft.com/en-us/azure/devops-project/azure-devops-project-github)
- [Create a CI/CD pipeline for Python with Azure DevOps Starter](https://docs.microsoft.com/en-us/azure/devops-project/azure-devops-project-python?WT.mc_id=udacity_learn-wwl)
- [Continuous deployment to Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github#option-1-use-app-service-kudu-build-server?WT.mc_id=udacity_learn-wwl)
- [Flask on Azure App Services](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=bash&WT.mc_id=udacity_learn-wwl&pivots=python-framework-flask)
- [Azure Pipelines for Python](https://docs.microsoft.com/en-us/azure/devops/pipelines/ecosystems/python?view=azure-devops&WT.mc_id=udacity_learn-wwl)
