# BoschUdacity_project3

## Ensuring Quality Releases using Azure CI/CD Pipeline

### Status badge
[![Build Status](https://dev.azure.com/odluser213202/BoschUdacity_project3/_apis/build/status/adedayoas91.BoschUdacity_project3?branchName=main)](https://dev.azure.com/odluser213202/BoschUdacity_project3/_build/latest?definitionId=1&branchName=main)

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

4. Azure DevOps

>Create a new Azure DevOps Project and Service Connections

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

<img width="1440" alt="Screenshot 2022-10-26 at 13 33 34" src="https://user-images.githubusercontent.com/47278559/198081303-44ed9854-717a-41e9-873b-8dc9936fe605.png">

<img width="1440" alt="Screenshot 2022-10-26 at 13 34 52" src="https://user-images.githubusercontent.com/47278559/198081385-fda277b5-ae9e-4e92-8f24-6f52ab400547.png">

<img width="1440" alt="Screenshot 2022-10-26 at 13 36 14" src="https://user-images.githubusercontent.com/47278559/198081430-ebcd3385-2308-4fd3-b5e9-cab4bcd125a0.png">

Other screenshots from the Provision pipeline can be found in the following in the [screenshots folder](https://github.com/adedayoas91/BoschUdacity_project3/tree/main/screenshots)  

Successful completion of this creates the webapp which I have named `myProject3-Appservice`. A screenshot of successful creation of the webapp both in the Azure portal as well as loading the webapp URL are shown below in that order:

<img width="1440" alt="Screenshot 2022-10-26 at 13 36 51" src="https://user-images.githubusercontent.com/47278559/198081533-98773001-854d-4703-837e-7743710d915d.png">

<img width="1440" alt="Screenshot 2022-10-26 at 13 37 08" src="https://user-images.githubusercontent.com/47278559/198081587-31ac3d8f-f9be-420f-b346-ea427376490c.png">

> I then added to the pipeline to build and deploy infrastructures as shown below:

<img width="1440" alt="Screenshot 2022-10-26 at 14 02 50" src="https://user-images.githubusercontent.com/47278559/198089145-f7495a26-236c-4be9-b104-6425fce19420.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 02 58" src="https://user-images.githubusercontent.com/47278559/198089362-b51e3ef6-e62e-453c-83ac-63904b9d2259.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 06" src="https://user-images.githubusercontent.com/47278559/198089424-1ddd5e57-bb84-4ed5-8d3d-14c4454048c2.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 12" src="https://user-images.githubusercontent.com/47278559/198089487-c2acf02d-88b4-4401-8286-2c9573878673.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 19" src="https://user-images.githubusercontent.com/47278559/198089548-d6c261c3-a8ac-4622-b94b-b987421a483a.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 29" src="https://user-images.githubusercontent.com/47278559/198089651-933bd505-f63a-42ff-9599-31d79db14716.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 36" src="https://user-images.githubusercontent.com/47278559/198090544-9a7977ff-889c-48fd-be0d-cf15d16e2bc1.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 43" src="https://user-images.githubusercontent.com/47278559/198090564-876f411e-54bb-4f6f-bcf8-a78af20f89c8.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 50" src="https://user-images.githubusercontent.com/47278559/198090578-116daf07-581b-4eeb-b8ed-e0e785b61556.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 03 59" src="https://user-images.githubusercontent.com/47278559/198090592-084a91fc-166a-4c0d-9f97-6b0412b79a6f.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 06" src="https://user-images.githubusercontent.com/47278559/198090604-885a4041-b58e-4963-a9e4-34f1b26f82b2.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 13" src="https://user-images.githubusercontent.com/47278559/198090619-07c9c8be-c830-49d7-81bf-98a05632a32c.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 20" src="https://user-images.githubusercontent.com/47278559/198090655-ab8b2475-a719-4bfe-91f3-6e5a0724f18a.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 27" src="https://user-images.githubusercontent.com/47278559/198090676-e3e8a469-3e02-4325-9654-db90ce81b1a7.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 36" src="https://user-images.githubusercontent.com/47278559/198090696-0f5ed4e1-0a9f-456a-aca2-0faa8e222927.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 45" src="https://user-images.githubusercontent.com/47278559/198090713-6929c52a-a62b-444b-a04b-6b5cd62ac3a0.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 52" src="https://user-images.githubusercontent.com/47278559/198090762-10215bc5-2a4a-4ad7-9008-0f179f484a7a.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 04 59" src="https://user-images.githubusercontent.com/47278559/198090780-31d945ba-b741-4472-921e-9b47605c9ba4.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 05 06" src="https://user-images.githubusercontent.com/47278559/198090843-e8aebed8-3bb0-4d2a-960b-c37144fb9efb.png">

> From above, successful `Build` and `Deploy` led to the creation of the Fake RestAPI been deployed in the webapp. I then copied the `Request URL` for use in JMeter testings as shown in the screenshot below 

<img width="1440" alt="Screenshot 2022-10-26 at 14 05 48" src="https://user-images.githubusercontent.com/47278559/198084355-5db39729-5e82-4793-9185-304b73686d44.png">

<img width="1440" alt="Screenshot 2022-10-26 at 14 06 06" src="https://user-images.githubusercontent.com/47278559/198084406-045b6a88-fc78-4c74-b13a-02f5afcd2469.png">

<img width="1440" alt="Screenshot 2022-10-26 at 14 06 28" src="https://user-images.githubusercontent.com/47278559/198084433-2612c977-0143-42c9-b798-1b863bc047d6.png">

> I then go ahead using the `Request URL` copied above and use it for tests in JMeter as shown below:
- For the endurance test
<img width="1440" alt="Screenshot 2022-10-26 at 14 12 42" src="https://user-images.githubusercontent.com/47278559/198092184-c9ec2f49-db77-4478-bd1e-06ce9ecfc357.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 15 13" src="https://user-images.githubusercontent.com/47278559/198092261-8b913e6f-58d8-4f4e-b8bc-13dbc9a1855d.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 15 20" src="https://user-images.githubusercontent.com/47278559/198092502-bb2bc484-53d6-4b28-ac26-417d83cca666.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 16 37" src="https://user-images.githubusercontent.com/47278559/198092621-e31107e5-fee4-44ec-8553-aa4380129cb7.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 16 46" src="https://user-images.githubusercontent.com/47278559/198092719-02e4444e-3594-4b10-904a-e4623430a322.png">

- For the stress test
<img width="1440" alt="Screenshot 2022-10-26 at 14 20 45" src="https://user-images.githubusercontent.com/47278559/198092809-d7c1c91d-e27a-4a84-9af3-05f0bbc7f2bc.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 21 32" src="https://user-images.githubusercontent.com/47278559/198092855-cdfeb2bd-6af9-4af7-94db-a7e562e2f6a7.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 22 30" src="https://user-images.githubusercontent.com/47278559/198092875-abdd71af-6625-4b6b-9637-7ac99236380d.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 22 50" src="https://user-images.githubusercontent.com/47278559/198092903-6224cf9d-0035-4b27-a769-65e5c1e8a316.png">

> HTML reports of both the endurance and stress test passed at 100 percent as shown in the following screenshots
<img width="1440" alt="Screenshot 2022-10-26 at 17 29 05" src="https://user-images.githubusercontent.com/47278559/198098622-b4f8ca4b-93da-4d88-ac84-326a28e31334.png">
<img width="1440" alt="Screenshot 2022-10-26 at 17 29 35" src="https://user-images.githubusercontent.com/47278559/198098671-b5783b92-97e2-426c-8bb0-57ca5c9e8665.png">


5. I then included the test section into the pipeline and the results are as shown below in screenshots. Please refer to the [screenshots folder](https://github.com/adedayoas91/BoschUdacity_project3/tree/main/screenshots) for possible screenshots that are not included here.

<img width="1440" alt="Screenshot 2022-10-26 at 14 35 50" src="https://user-images.githubusercontent.com/47278559/198093470-7321f0c6-ece1-40de-9d05-034c511868cb.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 35 58" src="https://user-images.githubusercontent.com/47278559/198093501-26e8acd4-fac2-4985-add0-340b3040b9c9.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 06" src="https://user-images.githubusercontent.com/47278559/198093528-19e8ed3c-3243-45d8-8db3-8d0ec29baecb.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 13" src="https://user-images.githubusercontent.com/47278559/198093553-54833a36-afa4-4a5b-b8fb-0a87fecb149c.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 19" src="https://user-images.githubusercontent.com/47278559/198093597-c45931fb-9524-4828-8f0a-22270c12eede.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 27" src="https://user-images.githubusercontent.com/47278559/198093625-beceaef9-41c8-4da7-8b45-4d41ffcc8629.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 35" src="https://user-images.githubusercontent.com/47278559/198093673-989040ed-7f4b-4f28-89aa-88f87a7da6b2.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 42" src="https://user-images.githubusercontent.com/47278559/198093694-a000454f-8e38-458f-96a7-b3407fbadcc4.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 36 53" src="https://user-images.githubusercontent.com/47278559/198093727-e77eaf50-8812-4829-9bd3-62519c339ef7.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 37 00" src="https://user-images.githubusercontent.com/47278559/198093750-a0b14ec2-067c-4989-904d-b2ac1918bd66.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 37 28" src="https://user-images.githubusercontent.com/47278559/198093785-6f105098-d64c-4177-b233-d6617f884952.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 37 36" src="https://user-images.githubusercontent.com/47278559/198093812-a17f1f4a-6591-4037-b231-cef03e6b0102.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 38 30" src="https://user-images.githubusercontent.com/47278559/198093846-741923be-6c73-4bc8-87f9-be207a02a5c3.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 38 37" src="https://user-images.githubusercontent.com/47278559/198093880-d1651d9d-a32d-455a-981a-261e764d3ddd.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 38 45" src="https://user-images.githubusercontent.com/47278559/198093905-7b6ad0ee-8ad9-44a5-9526-9c1f5cddc32a.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 38 52" src="https://user-images.githubusercontent.com/47278559/198093922-e82b2c81-1e26-4d9f-8381-d8267d34d478.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 03" src="https://user-images.githubusercontent.com/47278559/198093946-25322380-521a-44e4-ab2a-5b3f70d9d5e1.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 11" src="https://user-images.githubusercontent.com/47278559/198094010-3aa364b6-208c-4085-aa78-0525325cd9a2.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 23" src="https://user-images.githubusercontent.com/47278559/198094092-eea9dd34-f9ab-48bf-9018-0fe93f60cda1.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 33" src="https://user-images.githubusercontent.com/47278559/198094120-66913d63-6ad0-4beb-bcac-dc01ae1f0dad.png">


> Also there are screenshots from the Newmann test results
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 41" src="https://user-images.githubusercontent.com/47278559/198094151-dae89639-f4c7-45b8-8709-ec4380d3e7f4.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 48" src="https://user-images.githubusercontent.com/47278559/198094182-c117c148-e3b9-4f9f-9404-0b280ddd192c.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 39 55" src="https://user-images.githubusercontent.com/47278559/198094210-c7c15f36-dc4e-44d5-a3bb-97841517afab.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 40 02" src="https://user-images.githubusercontent.com/47278559/198094235-c05ece3b-c30b-4c50-9052-ddfb8a42f525.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 40 09" src="https://user-images.githubusercontent.com/47278559/198094284-6b194c8f-ff6c-4ccb-9786-d186ce7879aa.png">

#### Also, run test log for the regression and validation are shown in the following screenshots

<img width="1440" alt="Screenshot 2022-10-26 at 14 41 19" src="https://user-images.githubusercontent.com/47278559/198097467-cb915495-03b4-4e55-abdc-5b3f5450e961.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 41 27" src="https://user-images.githubusercontent.com/47278559/198097500-c1797375-4c3b-4c1e-84be-917111bdbde1.png">
<img width="1440" alt="Screenshot 2022-10-26 at 14 41 42" src="https://user-images.githubusercontent.com/47278559/198097529-87d0f711-915b-4d7e-b271-13feea5fb280.png">

Note, the downloaded regression and validation files can be found in the [Downloaded regression files](https://github.com/adedayoas91/BoschUdacity_project3/tree/main/Downloaded regression files)

> A request alert was created for the webapp and can be seen as followed in the below screenshots

<img width="1440" alt="Screenshot 2022-10-26 at 14 58 12" src="https://user-images.githubusercontent.com/47278559/198086423-84bb13c5-0346-4ed7-a18c-35b302bc8a65.png">

<img width="1440" alt="Screenshot 2022-10-26 at 15 03 38" src="https://user-images.githubusercontent.com/47278559/198086453-6b2714c9-c415-410b-8fc5-bf7236880bc5.png">


An email alert received when the appservice encountered a request overload is as shown below as well

<img width="1440" alt="Screenshot 2022-10-26 at 17 30 13" src="https://user-images.githubusercontent.com/47278559/198086563-35450941-3de5-40d4-a228-0a969fa560c8.png">

<img width="1440" alt="Screenshot 2022-10-26 at 17 30 32" src="https://user-images.githubusercontent.com/47278559/198086657-a289af38-380a-4a60-96fb-bc3629a24ecd.png">

> Log analytics report is shown below when the query was ran
<img width="1440" alt="Screenshot 2022-10-26 at 15 51 31" src="https://user-images.githubusercontent.com/47278559/198098270-a4fb51a9-1110-419c-95f6-c8c5ee89331e.png">


> The final stage of the pipeline was also completed and all tests were passed as shown below

<img width="1440" alt="Screenshot 2022-10-26 at 14 35 50" src="https://user-images.githubusercontent.com/47278559/198086985-2ede76df-61de-4ecd-b429-3110c91d3b1a.png">

<img width="1440" alt="Screenshot 2022-10-26 at 14 36 13" src="https://user-images.githubusercontent.com/47278559/198087046-6cc4948a-89bc-4c1d-8a92-a7106c473cca.png">

<img width="1440" alt="Screenshot 2022-10-26 at 14 40 32" src="https://user-images.githubusercontent.com/47278559/198086867-3b757e2e-711c-4ace-8f9c-ad0449103356.png">

<img width="1440" alt="Screenshot 2022-10-26 at 14 42 33" src="https://user-images.githubusercontent.com/47278559/198086805-c2ab4a40-cc5d-4953-9620-aefb17068739.png">


### Please find further screenshots for all stages of the pipeline in the [screenshots folder](https://github.com/adedayoas91/BoschUdacity_project3/tree/main/screenshots)

> In the end, I ensured to delete all resources to save cost

<img width="1440" alt="Screenshot 2022-10-26 at 19 25 57" src="https://user-images.githubusercontent.com/47278559/198095000-b7ee3cdc-fc4f-46e3-ba7e-dcfcb834c3a1.png">

> This is what the final repo looks like after updating the repo in GitHub

<img width="1440" alt="Screenshot 2022-10-26 at 19 47 28" src="https://user-images.githubusercontent.com/47278559/198099354-d8316ca7-d177-42a8-a18f-5f1bc44bf54a.png">


### Resources
Helpful resources from Microsoft are listed below

- [Design a CI/CD pipeline using Azure DevOps](https://docs.microsoft.com/en-us/azure/architecture/example-scenario/apps/devops-dotnet-webapp)
- [Create a CI/CD pipeline for GitHub repo using Azure DevOps Starter](https://docs.microsoft.com/en-us/azure/devops-project/azure-devops-project-github)
- [Create a CI/CD pipeline for Python with Azure DevOps Starter](https://docs.microsoft.com/en-us/azure/devops-project/azure-devops-project-python?WT.mc_id=udacity_learn-wwl)
- [Continuous deployment to Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/deploy-continuous-deployment?tabs=github#option-1-use-app-service-kudu-build-server?WT.mc_id=udacity_learn-wwl)
- [Flask on Azure App Services](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=bash&WT.mc_id=udacity_learn-wwl&pivots=python-framework-flask)
- [Azure Pipelines for Python](https://docs.microsoft.com/en-us/azure/devops/pipelines/ecosystems/python?view=azure-devops&WT.mc_id=udacity_learn-wwl)
